"use server";

import { sendEmailVerificationEmail } from "@/email/send";
import { parseFormData } from "@/lib/form";
import { hashPassword } from "@/lib/password";
import { nameCase } from "@/lib/text";
import prisma from "@/prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";

const random6DigitNumber = () => Math.floor(100000 + Math.random() * 900000).toString();

export async function checkEmail(email: string) {
	if (!email) return { ok: false, data: { stage: "NO_EMAIL" }, message: ["Please provide an email address."] };
	const processedEmail = email.toLowerCase().trim();
	const user = await prisma.user.findFirst({
		where: { email: processedEmail },
		include: { Account: true, Student: true, Blacklist: true },
	});

	const Blacklist = user?.Blacklist;
	const blacklistGenericMessage = "You are blacklisted from the system. Please contact us for more information.";

	if (Blacklist) return { ok: true, data: { stage: "BLACKLIST" }, message: [Blacklist.publicDescription || blacklistGenericMessage] };

	const account = user?.Account[0];

	if (account) {
		return { ok: true, data: { stage: "USER_WITH_ACCOUNT" }, message: ["You already have an account. Please login."] };
	}

	if (user && !account) {
		await prisma.$transaction(async (tx) => {
			const randomCode = random6DigitNumber();
			await tx.pendingHalfUser.deleteMany({ where: { email: processedEmail } });
			await tx.pendingUser.deleteMany({ where: { email: processedEmail } });
			const selectedUser = await tx.pendingHalfUser.create({
				data: { email: processedEmail, code: randomCode, user: { connect: { email: processedEmail } } },
				select: { user: { select: { officialName: true } } },
			});
			await sendEmailVerificationEmail({
				email: processedEmail,
				officialName: selectedUser.user.officialName,
				code: `${randomCode.slice(0, 3)}-${randomCode.slice(3)}`,
			});
		});
		return { ok: true, data: { stage: "USER_WITHOUT_ACCOUNT" }, message: [] };
	}

	if (!user) {
		let schools;
		try {
			schools = await prisma.school.findMany({ where: { isPublic: true }, orderBy: { name: "asc" } });
		} catch (e) {
			return { ok: false, data: null, message: ["An error occured."] };
		}
		return { ok: true, data: { stage: "NO_USER", schools: schools }, message: [] };
	}
}

export async function approveHalfUser(email: string, code: string, password: string) {
	const processedEmail = email.toLowerCase().trim();
	const account = await prisma.pendingHalfUser.findFirst({
		where: { email: processedEmail, code: code },
		include: { user: true },
	});
	if (!account) return { ok: false, message: ["Invalid verification code."] };
	let user;

	try {
		await prisma.$transaction(async (tx) => {
			await tx.pendingHalfUser.delete({ where: { email: processedEmail } });
			const hashedPassword = await hashPassword(password);
			user = await tx.user.update({
				where: { id: account.user.id },
				data: { Account: { create: { password: hashedPassword } } },
			});
		});
	} catch (e) {
		return { ok: false, message: ["Failed to create account."] };
	}
	return { ok: true, message: [`Account created. Your user ID is ${user.id}`] };
}

export async function createPendingUser(formData: FormData, email: string) {
	email = email.toLowerCase().trim();

	const user = await prisma.user.findFirst({
		where: { email: email },
	});

	if (user) return { ok: false, message: ["User already exists."] };

	const schema = z.object({
		email: z.string().trim().toLowerCase().email(),
		officialName: z.string().trim().transform(nameCase),
		officialSurname: z.string().trim().transform(nameCase),
		schoolId: z.string().optional().nullable(),
	});

	const parsedFormData = parseFormData(formData);
	const { error, data } = schema.safeParse({ ...parsedFormData, email });

	if (error) return { ok: false, message: ["Invalid data."] };

	const { schoolId, ...rest } = data;

	let newPendingUserData;

	try {
		await prisma.$transaction(async (tx) => {
			const randomCode = random6DigitNumber();
			await prisma.pendingUser.deleteMany({ where: { email: email } });
			newPendingUserData = await prisma.pendingUser.create({
				data: {
					...rest,
					code: randomCode,
					...(schoolId ? { school: { connect: { id: schoolId } } } : {}),
				},
			});
			await sendEmailVerificationEmail({
				email: data.email,
				officialName: data.officialName,
				code: `${randomCode.slice(0, 3)}-${randomCode.slice(3)}`,
			});
		});
	} catch (e) {
		return { ok: false, message: ["Failed to create user."] };
	}
	return { ok: true, message: ["User created."], data: { id: newPendingUserData.id, stage: "NEW_PENDING_USER_EMAIL_PASSWORD" } };
}

export async function createNewUser(id, password, verificationCode) {
	const selectedPendingUser = await prisma.pendingUser.findFirst({
		where: { id: id },
	});

	if (!selectedPendingUser) return { ok: false, message: ["Invalid user."] };

	if (selectedPendingUser.code !== verificationCode) return { ok: false, message: ["Invalid verification code."] };

	let user;

	try {
		await prisma.$transaction(async (tx) => {
			const hashedPassword = await hashPassword(password);
			const twelveDigitNumber = Math.floor(100000000000 + Math.random() * 900000000000).toString();
			user = await tx.user.create({
				data: {
					id: twelveDigitNumber,
					officialName: selectedPendingUser.officialName,
					officialSurname: selectedPendingUser.officialSurname,
					email: selectedPendingUser.email,
					Account: { create: { password: hashedPassword } },
					...(selectedPendingUser.schoolId
						? {
								Student: {
									connect: {
										id: selectedPendingUser.schoolId,
									},
								},
						  }
						: {}),
				},
			});
			await tx.pendingUser.delete({ where: { id: id } });
		});
	} catch (e) {
		return { ok: false, message: ["Failed to create account."] };
	}
	return { ok: true, message: [`Account created. Your user ID is ${user.id}`], data: { stage: "NEW_ACCOUNT_CREATED" } };
}
