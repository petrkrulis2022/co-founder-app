import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  return prisma.user.create({
    data: {
      id: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
    },
  });
}
