import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const headerPayload = req.headers;
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 },
    );
  }

  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: {
    type: string;
    data: { id: string; email_addresses?: { email_address: string }[] };
  };
  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof evt;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = evt;

  if (type === "user.created") {
    const email = data.email_addresses?.[0]?.email_address ?? "";
    await prisma.user.upsert({
      where: { id: data.id },
      update: { email },
      create: { id: data.id, email },
    });
  }

  if (type === "user.deleted") {
    await prisma.user
      .delete({
        where: { id: data.id },
      })
      .catch(() => {
        // User might not exist in our DB yet
      });
  }

  return NextResponse.json({ received: true });
}
