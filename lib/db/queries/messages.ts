import { prisma } from "@/lib/db/prisma";
import type { Message } from "@prisma/client";

export async function getMessages(stageId: string): Promise<Message[]> {
  return prisma.message.findMany({
    where: { stageId },
    orderBy: { createdAt: "asc" },
  });
}

export async function createMessage(
  stageId: string,
  role: string,
  content: string,
): Promise<Message> {
  return prisma.message.create({
    data: { stageId, role, content },
  });
}
