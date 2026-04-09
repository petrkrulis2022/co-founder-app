import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_CHARS = 50000; // ~12k tokens — enough context without blowing the window

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Failed to parse form data" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large (max 10 MB)" },
      { status: 413 }
    );
  }

  const fileName = file.name ?? "document";
  const mimeType = file.type;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let text = "";

  try {
    if (
      mimeType === "application/pdf" ||
      fileName.toLowerCase().endsWith(".pdf")
    ) {
      const pdfParseModule = await import("pdf-parse");
      const pdfParse = (pdfParseModule as unknown as { default: (buf: Buffer) => Promise<{ text: string }> }).default ?? pdfParseModule;
      const parsed = await (pdfParse as (buf: Buffer) => Promise<{ text: string }>)(buffer);
      text = parsed.text;
    } else if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.toLowerCase().endsWith(".docx")
    ) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (
      mimeType === "text/plain" ||
      fileName.toLowerCase().endsWith(".txt")
    ) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF, DOCX, or TXT file." },
        { status: 415 }
      );
    }
  } catch (err) {
    console.error("[parse-document] parse error:", err);
    return NextResponse.json(
      { error: "Failed to extract text from document" },
      { status: 422 }
    );
  }

  // Trim and truncate
  text = text.trim();
  if (!text) {
    return NextResponse.json(
      { error: "No readable text found in document" },
      { status: 422 }
    );
  }

  const truncated = text.length > MAX_CHARS;
  const excerpt = truncated ? text.slice(0, MAX_CHARS) : text;

  return NextResponse.json({
    text: excerpt,
    truncated,
    charCount: text.length,
    fileName,
  });
}
