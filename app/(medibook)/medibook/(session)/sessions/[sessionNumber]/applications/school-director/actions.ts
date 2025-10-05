"use server";

import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";

export async function changeSchoolDirectorApplicationStatus(formData, selectedSessionNumber) {
  const authSession = await auth();
  if (!authSession) return { ok: false, message: "Unauthorized" };
  const isSeniorDirector = authorize(authSession, [s.management]);
  if (!isSeniorDirector) return { ok: false, message: "Unauthorized" };

  const autoOpenTime = formData.get("schoolDirectorApplicationsAutoOpenTime");
  const autoCloseTime = formData.get("schoolDirectorApplicationsAutoCloseTime");

  const selectedSession = await prisma.session.findUnique({
    where: {
      number: selectedSessionNumber,
    },
  });

  if (!selectedSession) {
    return { ok: false, message: "Session not found" };
  }

  if (!selectedSession.isCurrent) return { ok: false, message: "Session is not current" };

  const res = await prisma.session.update({
    where: {
      number: selectedSessionNumber,
    },
    data: {
      ...(autoOpenTime && { schoolDirectorApplicationsAutoOpenTime: new Date(autoOpenTime) }),
      ...(autoCloseTime && { schoolDirectorApplicationsAutoCloseTime: new Date(autoCloseTime) }),
    },
  });

  return { ok: true, message: "Settings updated." };
}

export async function isSchoolDirectorApplicationsForceOpenChangeAction(data, selectedSessionNumber) {
  const authSession = await auth();
  if (!authSession) return { ok: false, message: "Unauthorized" };
  const isSeniorDirector = authorize(authSession, [s.management]);
  if (!isSeniorDirector) return { ok: false, message: "Unauthorized" };

  const selectedSession = await prisma.session.findUnique({
    where: {
      number: selectedSessionNumber,
    },
  });

  if (!selectedSession) {
    return { ok: false, message: "Session not found" };
  }

  if (!selectedSession.isCurrent) return { ok: false, message: "Session is not current" };

  const res = await prisma.session.update({
    where: {
      number: selectedSessionNumber,
    },
    data: {
      isSchoolDirectorApplicationsForceOpen: data,
    },
  });

  return { ok: true, message: "Settings updated." };
}

export async function isSchoolDirectorApplicationsAutoOpenChangeAction(data, selectedSessionNumber) {
  const authSession = await auth();
  if (!authSession) return { ok: false, message: "Unauthorized" };
  const isSeniorDirector = authorize(authSession, [s.management]);
  if (!isSeniorDirector) return { ok: false, message: "Unauthorized" };

  const selectedSession = await prisma.session.findUnique({
    where: {
      number: selectedSessionNumber,
    },
  });

  if (!selectedSession) {
    return { ok: false, message: "Session not found" };
  }

  if (!selectedSession.isCurrent) return { ok: false, message: "Session is not current" };

  const res = await prisma.session.update({
    where: {
      number: selectedSessionNumber,
    },
    data: {
      isSchoolDirectorApplicationsAutoOpen: data,
    },
  });

  return { ok: true, message: "Settings updated." };
}
