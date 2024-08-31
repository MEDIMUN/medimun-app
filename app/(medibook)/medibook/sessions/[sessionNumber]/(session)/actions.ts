"use server";

import prisma from "@/prisma/client";
import { s, authorize } from "@/lib/authorize";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function addCommittee(formData) {
	const session = await auth();
	const sessionNumber = formData.get("sessionNumber");
	const name = formData.get("name");
	const description = formData.get("description");
	const shortName = formData.get("shortName");
	const committeeType = formData.get("committeeType");
	const slug = formData.get("slug");
	const topic1 = formData.get("topic1");
	const topic2 = formData.get("topic2");
	const topic3 = formData.get("topic3");

	if (!authorize(session, [s.management]))
		return {
			ok: false,
			error: "Unauthorized",
			title: "Unauthorized",
			description: "You are not authorized to perform this action",
			variant: "destructive",
		};
	if (!sessionNumber || !name || !committeeType)
		return { ok: false, error: "Invalid input", title: "Invalid input", description: "Please fill in all required inputs", variant: "destructive" };
	if (description && (description.length > 1000 || description.length < 10))
		return {
			ok: false,
			error: "Invalid input",
			title: "Invalid input",
			description: "Description must be between 10 and 1000 characters",
			variant: "destructive",
		};
	if (name.length > 50 || name.length < 3)
		return {
			ok: false,
			error: "Invalid input",
			title: "Invalid input",
			description: "Name must be between 3 and 50 characters",
			variant: "destructive",
		};
	if (shortName && (shortName.length > 10 || shortName.length < 2))
		return {
			ok: false,
			error: "Invalid input",
			title: "Invalid input",
			description: "Short name must be between 2 and 10 characters",
			variant: "destructive",
		};
	if (slug && (slug.length > 30 || slug.length < 2))
		return {
			ok: false,
			error: "Invalid input",
			title: "Invalid input",
			description: "Slug must be between 2 and 10 characters",
			variant: "destructive",
		};
	if (slug && !/^[a-zA-Z0-9-]*$/.test(slug))
		return {
			ok: false,
			error: "Invalid input",
			title: "Invalid input",
			description: "Slug must only contain characters, numbers and dashes",
			variant: "destructive",
		};
	if (slug) {
		let slugExists;
		try {
			slugExists = await prisma.committee.findFirst({ where: { slug, session: { number: sessionNumber } } });
		} catch (e) {
			return {
				ok: false,
				error: "Internal server error",
				title: "Internal server error",
				description: "An error occurred while adding the committee",
				variant: "destructive",
			};
		}
		if (slugExists) return { ok: false, error: "Invalid input", title: "Slug already used for another committee", variant: "destructive" };
	}

	try {
		await prisma.committee.create({
			data: {
				name,
				description,
				shortName,
				slug: slug,
				type: committeeType,
				topic1,
				topic2,
				topic3,
				session: {
					connect: {
						number: sessionNumber,
					},
				},
			},
		});
	} catch (e) {
		return {
			ok: false,
			error: "Internal server error",
			title: "Internal server error",
			description: "An error occurred while adding the committee",
			variant: "destructive",
		};
	}
	return { ok: true, title: "Committee added", description: "The committee was successfully added", variant: "default" };
}

export async function addDepartment(formData) {
	const session = await auth();
	const sessionNumber = formData.get("sessionNumber");
	const name = formData.get("name");
	const description = formData.get("description");
	const shortName = formData.get("shortName");
	const departmentType = formData.get("departmentType");
	const slug = formData.get("slug");

	if (!authorize(session, [s.admins, s.board, s.sec]))
		return {
			ok: false,
			error: "Unauthorized",
			title: "Unauthorized",
			description: "You are not authorized to perform this action",
			variant: "destructive",
		};
	if (!sessionNumber || !name || !departmentType)
		return { ok: false, error: "Invalid input", title: "Invalid input", description: "Please fill in all required inputs", variant: "destructive" };
	if (description && (description.length > 100 || description.length < 10))
		return {
			ok: false,
			error: "Invalid input",
			title: "Invalid input",
			description: "Description must be between 10 and 100 characters",
			variant: "destructive",
		};
	if (name.length > 50 || name.length < 3)
		return {
			ok: false,
			error: "Invalid input",
			title: "Invalid input",
			description: "Name must be between 3 and 50 characters",
			variant: "destructive",
		};
	if (shortName && (shortName.length > 10 || shortName.length < 2))
		return {
			ok: false,
			error: "Invalid input",
			title: "Invalid input",
			description: "Short name must be between 2 and 10 characters",
			variant: "destructive",
		};
	if (slug && (slug.length > 30 || slug.length < 2))
		return {
			ok: false,
			error: "Invalid input",
			title: "Invalid input",
			description: "Slug must be between 2 and 10 characters",
			variant: "destructive",
		};
	if (slug && !/^[a-zA-Z0-9-]*$/.test(slug))
		return {
			ok: false,
			error: "Invalid input",
			title: "Invalid input",
			description: "Slug must only contain characters, numbers and dashes",
			variant: "destructive",
		};
	if (slug) {
		let slugExists;
		try {
			slugExists = await prisma.department.findFirst({ where: { slug, session: { number: sessionNumber } } });
		} catch (e) {
			return {
				ok: false,
				error: "Internal server error",
				title: "Internal server error",
				description: "An error occurred while adding the department",
				variant: "destructive",
			};
		}
		if (slugExists) return { ok: false, error: "Invalid input", title: "Slug already used for another department", variant: "destructive" };
	}

	try {
		await prisma.department.create({
			data: {
				name,
				description,
				shortName,
				slug: slug,
				type: departmentType || null,
				session: {
					connect: {
						number: sessionNumber,
					},
				},
			},
		});
	} catch (e) {
		return {
			ok: false,
			error: "Internal server error",
			title: "Internal server error",
			description: "An error occurred while adding the department",
			variant: "destructive",
		};
	}
	return { ok: true, title: "Department added", description: "The department was successfully added", variant: "default" };
}

export async function currentSession(formData) {
	const session = await auth();
	if (!authorize(session, [s.admin, s.sd])) redirect("/medibook/sessions");
	const sessionNumber = formData.get("sessionNumber");
	const password = formData.get("password");
	if (typeof password !== "string" || !password)
		return { ok: false, error: "Invalid input", title: "Invalid input", description: "Invalid input", variant: "destructive" };
	if (!sessionNumber) return { ok: false, error: "Invalid input", title: "Invalid input", description: "Invalid input", variant: "destructive" };
	let sessionExists, currentUser;

	try {
		prisma.$connect();
		currentUser = await prisma.user.findUnique({
			where: {
				id: session.user.id,
			},
			select: {
				account: {
					select: {
						password: true,
					},
				},
			},
		});
	} catch (e) {
		return {
			ok: false,
			title: "An error occured, please try again later",
			variant: "destructive",
		};
	}
	if (!currentUser) return { ok: false, error: "User does not exist", title: "User does not exist", variant: "destructive" };
	if (!(await verifyPassword(password, currentUser.account.password)))
		return { ok: false, error: "Incorrect password", title: "Incorrect password", variant: "destructive" };

	try {
		prisma.$connect();
		sessionExists = await prisma.session.findUnique({
			where: {
				number: sessionNumber,
			},
		});
	} catch (e) {
		return {
			ok: false,
			title: "An error occured, please try again later",
			variant: "destructive",
		};
	}
	if (!sessionExists) return { ok: false, error: "Session does not exist", title: "Session does not exist", variant: "destructive" };
	if (sessionExists.isCurrent) return { ok: false, error: "Session is already current", title: "Session is already current", variant: "destructive" };
	if (!sessionExists.theme)
		return { ok: false, error: "Session does not have a theme", title: "Session does not have a theme", variant: "destructive" };
	if (!sessionExists.phrase2)
		return { ok: false, error: "Session does not have a phrase 2", title: "Session does not have a phrase 2", variant: "destructive" };

	try {
		prisma.$connect();
		prisma.$transaction([
			prisma.session.updateMany({
				where: {
					isCurrent: true,
				},
				data: {
					isCurrent: false,
				},
			}),
			prisma.session.update({
				where: {
					number: sessionNumber,
				},
				data: {
					isCurrent: true,
				},
			}),
		]);
	} catch (e) {
		return {
			ok: false,
			title: "An error occured, please try again later",
			variant: "destructive",
		};
	}
	return { ok: true, title: "Updated Current Session", variant: "destructive" };
}

export async function editSession(formData) {
	const session = await auth();
	if (!authorize(session, [s.admin, s.sd])) redirect("/medibook/sessions");
	const sessionNumber = formData.get("sessionNumber");
	const theme = formData.get("theme");
	const phrase2 = formData.get("phrase2");

	let sessionExists;
	try {
		prisma.$connect();
		sessionExists = await prisma.session.findUnique({
			where: {
				number: sessionNumber,
			},
		});
	} catch (e) {
		return {
			ok: false,
			error: "Could not check if session exists",
			title: "An error occured, please try again later",
			variant: "destructive",
		};
	}
	if (!sessionExists) return { ok: false, error: "Session does not exist", title: "Session does not exist", variant: "destructive" };
	if (typeof theme !== "string" || typeof phrase2 !== "string")
		return { ok: false, error: "Invalid input", title: "Invalid input", description: "Invalid input", variant: "destructive" };
	if (theme && theme.length < 3)
		return { ok: false, error: "Theme must be at least 3 characters", title: "Theme must be at least 3 characters", variant: "destructive" };
	if (phrase2 && phrase2.length < 3)
		return { ok: false, error: "Phrase 2 must be at least 3 characters", title: "Phrase 2 must be at least 3 characters", variant: "destructive" };
	if (theme && theme.length > 30)
		return { ok: false, error: "Theme must be at most 30 characters", title: "Theme must be at most 22 characters", variant: "destructive" };
	if (phrase2 && phrase2.length > 50)
		return { ok: false, error: "Phrase 2 must be at most 50 characters", title: "Phrase 2 must be at most 40 characters", variant: "destructive" };
	try {
		prisma.$connect();
		await prisma.session.update({
			where: {
				number: sessionNumber,
			},
			data: {
				theme: theme,
				phrase2: phrase2,
			},
		});
	} catch (e) {
		return {
			ok: false,
			error: "Could not update session",
			title: "An error occured, please try again later",
			variant: "destructive",
		};
	}

	redirect("/medibook/sessions");
	return {
		ok: true,
		message: "Session updated",
	};
}
