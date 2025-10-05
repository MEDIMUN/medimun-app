"use server";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { auth } from "@/auth";

export async function addSession() {
  const authSession = await auth();
  if (!authSession || !authorize(authSession, [s.sd, s.admins])) {
    return { ok: false, message: "Unauthorized" };
  }

  const latestSession = await prisma.session.findFirst({
    orderBy: { numberInteger: "desc" },
  });

  const numberOfSessions = await prisma.session.count();

  if (numberOfSessions === 0) {
    try {
      await prisma.session.create({
        data: {
          number: "1",
          numberInteger: 1,
          isCurrent: true,
          isVisible: false,
        },
      });
    } catch (error) {
      return { ok: false, message: "Failed to create session" };
    }
    return { ok: true, message: "Session created" };
  }

  const isLatestSessionCurrent = latestSession?.isCurrent && latestSession?.isVisible && latestSession?.isMainShown;

  if (!isLatestSessionCurrent) {
    return { ok: false, message: "The latest session is not current" };
  }

  try {
    await prisma.session.create({
      data: {
        number: (latestSession.numberInteger + 1).toString(),
        numberInteger: latestSession.numberInteger + 1,
        isCurrent: false,
        isVisible: false,
        isMainShown: false,
      },
    });
  } catch (error) {
    return { ok: false, message: "Failed to create session" };
  }
  return { ok: true, message: "Session created" };
}
