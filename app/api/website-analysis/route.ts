import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db/prisma";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const ALLOWED_PROTOCOLS = ["https:", "http:"];
const MAX_CONTENT_LENGTH = 40_000; // chars

function validateUrl(raw: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("Invalid URL format");
  }
  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    throw new Error("Only http/https URLs are allowed");
  }
  // Block private/loopback ranges
  const host = parsed.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.startsWith("127.") ||
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    host === "0.0.0.0" ||
    host.endsWith(".local")
  ) {
    throw new Error("Private/loopback URLs are not allowed");
  }
  return parsed;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { url, projectId } = body as { url: string; projectId: string };

  if (!url || !projectId) {
    return NextResponse.json(
      { error: "Missing url or projectId" },
      { status: 400 },
    );
  }

  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true, name: true },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Validate URL (prevent SSRF)
  let parsedUrl: URL;
  try {
    parsedUrl = validateUrl(url);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  // Fetch website content
  let rawHtml: string;
  try {
    const res = await fetch(parsedUrl.toString(), {
      headers: { "User-Agent": "CoFounderBot/1.0 (website analysis)" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Could not fetch URL (HTTP ${res.status})` },
        { status: 422 },
      );
    }
    rawHtml = await res.text();
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch the website. Is it publicly accessible?" },
      { status: 422 },
    );
  }

  // Extract metadata (works even on SPAs where body text is empty)
  const extractMeta = (name: string) => {
    const m =
      rawHtml.match(
        new RegExp(
          `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`,
          "i",
        ),
      ) ||
      rawHtml.match(
        new RegExp(
          `<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`,
          "i",
        ),
      );
    return m ? m[1].trim() : "";
  };

  const pageTitle =
    (rawHtml.match(/<title[^>]*>([^<]+)<\/title>/i) ?? [])[1]?.trim() ?? "";
  const metaDesc = extractMeta("description") || extractMeta("og:description");
  const ogTitle = extractMeta("og:title");
  const ogImage = extractMeta("og:image");
  const twitterTitle = extractMeta("twitter:title");
  const twitterDesc = extractMeta("twitter:description");
  const canonical =
    (rawHtml.match(
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
    ) ?? [])[1] ?? "";

  // Strip HTML to readable body text
  const bodyText = rawHtml
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, MAX_CONTENT_LENGTH);

  // Build analysis payload — combine meta + body text so SPAs still work
  const metaBlock = [
    pageTitle && `Page title: ${pageTitle}`,
    ogTitle && `OG title: ${ogTitle}`,
    metaDesc && `Meta description: ${metaDesc}`,
    twitterTitle && `Twitter title: ${twitterTitle}`,
    twitterDesc && `Twitter description: ${twitterDesc}`,
    ogImage ? `OG image present: yes (${ogImage})` : `OG image present: no`,
    canonical && `Canonical URL: ${canonical}`,
  ]
    .filter(Boolean)
    .join("\n");

  const text = [metaBlock, bodyText].filter(Boolean).join("\n\n").trim();

  if (text.length < 20) {
    return NextResponse.json(
      {
        error:
          "This appears to be a fully client-rendered app with no static content. Try adding a URL to a page that has visible text, or check that the site is publicly accessible.",
      },
      { status: 422 },
    );
  }

  // Analyse with Claude
  const systemPrompt = `You are an expert marketing strategist and conversion rate optimiser specialising in Web3, crypto, and startup go-to-market strategy. 
Your job is to review the text content of a project website and return actionable, specific recommendations.
Respond ONLY in valid JSON matching this structure:
{
  "score": <number 1-10>,
  "summary": "<2-3 sentence overall impression>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "issues": [
    { "category": "<Messaging|CTA|Trust|Clarity|SEO|Community|Web3-specific>", "issue": "<what is wrong>", "fix": "<specific fix>" },
    ...
  ],
  "quickWins": ["<actionable quick win 1>", "<actionable quick win 2>", ...],
  "rewriteSuggestion": "<optional: rewrite of the main hero headline if it needs improving>"
}`;

  const isSpa = bodyText.length < 50;
  const userMessage = `Project name: ${project.name}
Website URL: ${parsedUrl.toString()}
${isSpa ? "Note: This site appears to be a client-side rendered app. Limited body text was available; analyse based on metadata and SEO signals." : ""}
Website content:
${text}

Analyse this website and return a JSON marketing audit with specific, actionable recommendations tailored to a Web3/crypto project.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawContent = message.content[0];
    if (rawContent.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Extract JSON from response
    const jsonMatch = rawContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ analysis });
  } catch (e) {
    console.error("Website analysis error:", e);
    return NextResponse.json(
      { error: "AI analysis failed. Please try again." },
      { status: 500 },
    );
  }
}
