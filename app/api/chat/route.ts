import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getProject } from "@/lib/db/queries/projects";
import { getOrCreateStage } from "@/lib/db/queries/stages";
import { createMessage, getMessages } from "@/lib/db/queries/messages";
import { assembleContext } from "@/lib/ai/context-assembler";
import { getStagePrompt } from "@/lib/ai/stage-prompts";
import { extractAndSave } from "@/lib/ai/output-extractor";
import { updateStageSummary } from "@/lib/db/queries/stages";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function getRatelimit() {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    process.env.UPSTASH_REDIS_REST_URL === "https://placeholder.upstash.io"
  ) {
    return null;
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(50, "1 h"),
    analytics: true,
  });
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const stageKey = searchParams.get("stageKey");

  if (!projectId || !stageKey) {
    return NextResponse.json(
      { error: "Missing projectId or stageKey" },
      { status: 400 },
    );
  }

  try {
    await getProject(projectId, userId);
    const stage = await getOrCreateStage(projectId, stageKey);
    const messages = await getMessages(stage.id);
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting
  const ratelimit = getRatelimit();
  if (ratelimit) {
    const { success } = await ratelimit.limit(userId);
    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Max 50 messages per hour." },
        { status: 429 },
      );
    }
  }

  const body = await req.json();
  const {
    projectId,
    stageKey,
    messages,
  }: {
    projectId: string;
    stageKey: string;
    messages: { role: string; content: string }[];
  } = body;

  if (!projectId || !stageKey || !messages?.length) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    // Verify ownership
    await getProject(projectId, userId);

    // Get or create stage
    const stage = await getOrCreateStage(projectId, stageKey);

    // Update stage status to in_progress if not started
    if (stage.status === "not_started") {
      const { prisma } = await import("@/lib/db/prisma");
      await prisma.stage.update({
        where: { id: stage.id },
        data: { status: "in_progress" },
      });
    }

    // Save the user message
    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg.role === "user") {
      await createMessage(stage.id, "user", lastUserMsg.content);
    }

    // Assemble context
    const context = await assembleContext(projectId);
    const systemPrompt = getStagePrompt(stageKey, context);

    // Build messages for Anthropic
    const anthropicMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Stream response
    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await anthropic.messages.stream({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: systemPrompt,
            messages: anthropicMessages,
          });

          for await (const event of response) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text;
              fullResponse += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          controller.close();

          // Fire-and-forget: save assistant message and update summary
          createMessage(stage.id, "assistant", fullResponse).catch(() => {});

          // Fire-and-forget: extract structured data from response
          extractAndSave(stageKey, fullResponse, projectId, stage.id).catch(
            () => {},
          );

          // Summarize last 3 messages for stage summary
          const allMessages = await getMessages(stage.id);
          const last3 = allMessages.slice(-3);
          if (last3.length >= 2) {
            const summaryPrompt =
              "Summarize the key founder insights from this conversation in 2-3 sentences. Focus on decisions made and key facts revealed.";
            const summaryResponse = await anthropic.messages.create({
              model: "claude-sonnet-4-20250514",
              max_tokens: 256,
              messages: [
                {
                  role: "user",
                  content: `${summaryPrompt}\n\n${last3.map((m) => `${m.role}: ${m.content}`).join("\n")}`,
                },
              ],
            });
            const summaryText =
              summaryResponse.content[0].type === "text"
                ? summaryResponse.content[0].text
                : "";
            if (summaryText) {
              updateStageSummary(projectId, stageKey, summaryText).catch(
                () => {},
              );
            }
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Stream error";
          controller.enqueue(encoder.encode(`\n\n[Error: ${message}]`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 },
    );
  }
}
