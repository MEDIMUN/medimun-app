"use server";

import { auth } from "@/auth";
import { permamentSCMembers } from "@/data/constants";
import { countries } from "@/data/countries";
import { sendEmailReceivedNewCertificateOfParticipation } from "@/email/send";
import { authorize, s } from "@/lib/authorize";
import { parseFormData } from "@/lib/parse-form-data";
import { entityCase } from "@/lib/text";
import { generateUserData, generateUserDataObject } from "@/lib/user";
import prisma from "@/prisma/client";
import { z } from "zod";

const sessionSchema = z.object({
  theme: z
    .string()
    .trim()
    .min(2, "Theme must be at least 2 characters long")
    .max(50, "Theme must be at most 50 characters long")
    .transform(entityCase)
    .optional()
    .nullable(),
  subTheme: z
    .string()
    .trim()
    .min(2, "Phrase must be at least 2 characters long")
    .max(50, "Phrase must be at most 50 characters long")
    .transform(entityCase)
    .optional()
    .nullable(),
});

/* description                          String?
welcomeText                          String?
about                                String? */

export async function updateSession(formData: FormData, selectedSessionNumber) {
  const authSession = await auth();

  const prismaUser = await prisma.user.findFirst({
    where: { id: authSession.user.id },
    include: { ...generateUserDataObject() },
    omit: { signature: true },
  });
  const selectedSession = await prisma.session.findFirst({
    where: {
      number: selectedSessionNumber,
    },
  });
  if (!selectedSession) return { ok: false, message: "Session not found" };
  const userData = generateUserData(prismaUser);
  const isManagement = authorize(authSession, [s.management]);
  if (!isManagement) return { ok: false, message: "Not Authorized" };

  const { error, data } = sessionSchema.safeParse(parseFormData(formData));

  if (error) return { ok: false, message: "Invalid Data" };

  try {
    await prisma.session.update({
      where: { number: selectedSessionNumber },
      data: data,
    });
  } catch {
    return { ok: false, message: "Could not update session." };
  }
  return { ok: true, message: "Session updated." };
}

const textsSchema = z.object({
  welcomeText: z.string().max(500).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  about: z.string().max(2000).optional().nullable(),
});

export async function updateSessionTexts(formData: FormData, selectedSessionNumber) {
  const authSession = await auth();

  const prismaUser = await prisma.user.findFirst({
    where: { id: authSession.user.id },
    include: { ...generateUserDataObject() },
    omit: { signature: true },
  });
  const selectedSession = await prisma.session.findFirst({
    where: {
      number: selectedSessionNumber,
    },
  });
  if (!selectedSession) return { ok: false, message: "Session not found" };
  const userData = generateUserData(prismaUser);
  const isManagement = authorize(userData, [s.management]);
  if (!isManagement) return { ok: false, message: "Not Authorized" };

  const { error, data } = textsSchema.safeParse(parseFormData(formData));

  if (error) return { ok: false, message: "Invalid Data" };

  try {
    await prisma.session.update({
      where: { number: selectedSessionNumber },
      data: data,
    });
  } catch {
    return { ok: false, message: "Could not update session." };
  }
  return { ok: true, message: "Session updated." };
}

const currentPricesSchema = z.object({
  delegatePrice: z.number().min(0).max(9999),
  directorPrice: z.number().min(0).max(9999),
});

export async function updateSessionPrices(formData: FormData, selectedSessionNumber) {
  const authSession = await auth();
  const isManagement = authorize(authSession, [s.management]);
  if (!isManagement) return { ok: false, message: "Not Authorized" };

  const selectedSession = await prisma.session.findFirst({
    where: {
      number: selectedSessionNumber,
    },
  });
  if (!selectedSession) return { ok: false, message: "Session not found" };

  const parsedFormData = parseFormData(formData);

  const { error, data } = currentPricesSchema.safeParse({
    delegatePrice: parseInt(parsedFormData.delegatePrice),
    directorPrice: parseInt(parsedFormData.directorPrice),
  });

  if (error) return { ok: false, message: "Invalid Data" };

  try {
    await prisma.session.update({
      where: { id: selectedSession.id },
      data: data,
    });
  } catch {
    return { ok: false, message: "Could not update session." };
  }
  return { ok: true, message: "Session updated." };
}

export async function setCurrentSession(sessionId) {
  const authSession = await auth();
  let selectedSession;
  const isAuthorized = authorize(authSession, [s.admins, s.sd]);

  if (!isAuthorized) return { ok: false, message: ["Not authorized."] };
  try {
    selectedSession = await prisma.session.findFirstOrThrow({
      where: { id: sessionId, isCurrent: false },
    });
  } catch {
    return { ok: false, message: ["Session not found."] };
  }

  try {
    await prisma.$transaction([
      prisma.session.update({
        where: { id: selectedSession.id },
        data: { isCurrent: true },
      }),
      prisma.session.updateMany({
        where: { NOT: { id: selectedSession.id } },
        data: { isCurrent: false },
      }),
    ]);
  } catch {
    return { ok: false, message: ["Could not set current session."] };
  }
  return { ok: true, message: ["Session set as current."] };
}

export async function setMainShown(sessionId) {
  const authSession = await auth();
  let selectedSession;
  const isAuthorized = authorize(authSession, [s.admins, s.sd]);

  if (!isAuthorized) return { ok: false, message: ["Not authorized."] };

  try {
    selectedSession = await prisma.session.findFirstOrThrow({
      where: { id: sessionId, isMainShown: false },
    });
  } catch {
    return { ok: false, message: ["Session not found."] };
  }

  try {
    await prisma.$transaction([
      prisma.session.update({
        where: { id: selectedSession.id },
        data: { isMainShown: true },
      }),
      prisma.session.updateMany({
        where: { NOT: { id: selectedSession.id } },
        data: { isMainShown: false },
      }),
    ]);
  } catch (e) {
    console.log(e);
    return { ok: false, message: ["Could not set main shown session."] };
  }
  return { ok: true, message: ["Session set as main shown."] };
}

export async function setVisible(sessionId: string) {
  const authSession = await auth();
  let selectedSession;
  const isAuthorized = authorize(authSession, [s.admins, s.sd]);
  if (!isAuthorized) return { ok: false, message: ["Not authorized."] };
  try {
    selectedSession = await prisma.session.findFirstOrThrow({
      where: { id: sessionId },
    });
  } catch {
    return { ok: false, message: ["Session not found."] };
  }

  if (selectedSession.isVisible) return { ok: false, message: ["Session is already visible."] };

  try {
    await prisma.session.update({
      where: { id: selectedSession.id },
      data: { isVisible: true },
    });
  } catch {
    return { ok: false, message: ["Could not set session as visible."] };
  }
  return { ok: true, message: ["Session set as fully visible."] };
}

export async function setHidden(sessionId: string) {
  const authSession = await auth();
  let selectedSession;
  const isAuthorized = authorize(authSession, [s.admins, s.sd]);
  if (!isAuthorized) return { ok: false, message: ["Not authorized."] };
  try {
    selectedSession = await prisma.session.findFirstOrThrow({
      where: { id: sessionId },
    });
  } catch {
    return { ok: false, message: ["Session not found."] };
  }

  if (!selectedSession.isVisible) return { ok: false, message: ["Session is already hidden."] };
  if (selectedSession.isMainShown) return { ok: false, message: ["Cannot hide the main shown session."] };

  try {
    await prisma.session.update({
      where: { id: selectedSession.id },
      data: { isVisible: false },
    });
  } catch {
    return { ok: false, message: ["Could not hide session."] };
  }
  return { ok: true, message: ["Session set as hidden."] };
}

export async function sessionNumbersChange(formData: FormData, selectedSessionNumber) {
  const schema = z.object({
    maxNumberOfGeneralAssemblyDelegationsPerSchool: z.number().int().min(1).max(99),
    minimumDelegateAgeOnFirstConferenceDay: z.number().int().min(1).max(999),
    maximumDelegateAgeOnFirstConferenceDay: z.number().int().min(1).max(999),
  });

  let selectedSession;
  try {
    selectedSession = await prisma.session.findFirst({
      where: {
        number: selectedSessionNumber,
      },
    });
  } catch {
    return { ok: false, message: "Session not found" };
  }

  const authSession = await auth();
  const isManagement = authorize(authSession, [s.management]);
  const parsedFormData = parseFormData(formData);

  const { error, data } = schema.safeParse({
    maxNumberOfGeneralAssemblyDelegationsPerSchool: parseInt(
      parsedFormData.maxNumberOfGeneralAssemblyDelegationsPerSchool,
    ),
    minimumDelegateAgeOnFirstConferenceDay: parseInt(parsedFormData.minimumDelegateAgeOnFirstConferenceDay),
    maximumDelegateAgeOnFirstConferenceDay: parseInt(parsedFormData.maximumDelegateAgeOnFirstConferenceDay),
  });

  if (error) return { ok: false, message: "Invalid Data" };

  if (data.minimumDelegateAgeOnFirstConferenceDay >= data.maximumDelegateAgeOnFirstConferenceDay)
    return { ok: false, message: "Minimum age should be less than maximum age." };

  if (!isManagement) return { ok: false, message: "Not Authorized" };

  try {
    await prisma.session.update({
      where: { number: selectedSession.number },
      data: data,
    });
  } catch (e) {
    return { ok: false, message: "Could not update session." };
  }
  return { ok: true, message: "Session updated." };
}

export async function sessionCountriesChange(formData: FormData, selectedSessionNumber) {
  const gaCountries = formData.get("generalAssemblyCountries");
  const scCountries = formData.get("securityCouncilCountriesOfYear");

  //split with comma or \n
  const separatedGAcountriesList = gaCountries?.split(/,|\n/).map((country) => country.trim());
  const separatedSCcountriesList = scCountries?.split(/,|\n/).map((country) => country.trim());

  //verify from countries list

  const allCountryCodes = countries.map((country) => country.countryCode);
  const permamentSCcountries = countries
    .filter((country) => country.isPermanentSC)
    .map((country) => country.countryCode);

  const filteredVerifiedGAcountries = separatedGAcountriesList.filter((country) => {
    return allCountryCodes.includes(country);
  });

  const filteredVerifiedSCcountries = separatedSCcountriesList.filter((country) => {
    return allCountryCodes.includes(country);
  });

  const removePermamentSCcountries = filteredVerifiedSCcountries.filter((country) => {
    return !permamentSCMembers.includes(country);
  });

  const addPermamentsBackToTheBeginningSC = permamentSCMembers.concat(removePermamentSCcountries);

  try {
    await prisma.session.update({
      where: { number: selectedSessionNumber },
      data: {
        countriesOfSession: filteredVerifiedGAcountries,
        securityCouncilCountriesOfYear: addPermamentsBackToTheBeginningSC,
      },
    });
  } catch {
    return { ok: false, message: "Could not update session." };
  }
  return { ok: true, message: "Session updated." };
}

export async function releaseCertificates({ sessionId, notify }) {
  const authSession = await auth();
  const isManagement = authorize(authSession, [s.management]);
  if (!isManagement) return { ok: false, message: "Not Authorized" };

  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
    },
  });
  if (!session) return { ok: false, message: "Session not found" };

  let selectedSession;

  try {
    selectedSession = await prisma.session.update({
      where: { id: session.id },
      data: {
        publishCertificates: true,
      },
    });
  } catch (e) {
    return { ok: false, message: "Could not update session." };
  }

  if (notify) {
    const certificates = await prisma.participationCertificate.findMany({
      where: {
        sessionId: selectedSession.id,
        isVoid: false,
        voidMessage: null,
      },
      include: {
        user: {
          select: {
            email: true,
            officialName: true,
            officialSurname: true,
          },
        },
      },
    });

    const emailPromises = certificates.map(async (certificate) => {
      sendEmailReceivedNewCertificateOfParticipation({
        email: certificate.user.email,
        officialName: certificate.user.officialName,
      });
    });
    await Promise.all(emailPromises);
  }

  return { ok: true, message: "Certificates released." };
}

export async function revokeCertificates({ sessionId }) {
  const authSession = await auth();
  const isManagement = authorize(authSession, [s.management]);
  if (!isManagement) return { ok: false, message: "Not Authorized" };

  const session = await prisma.session.findFirst({
    where: { id: sessionId },
  });
  if (!session) return { ok: false, message: "Session not found" };

  try {
    await prisma.session.update({
      where: { id: session.id },
      data: { publishCertificates: false },
    });
  } catch (e) {
    return { ok: false, message: "Could not update session." };
  }
  return { ok: true, message: "Certificates revoked." };
}
