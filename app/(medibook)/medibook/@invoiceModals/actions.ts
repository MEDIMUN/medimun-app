"use server";

import prisma from "@/prisma/client";
import { s, authorize } from "@/lib/authorize";
import { auth } from "@/auth";
import { z } from "zod";
import { entityCase } from "@/lib/text";
import { parseFormData } from "@/lib/parse-form-data";
import { sortItems } from "./default";
import { sendEmailSchoolInvoice, sendEmailSchoolReceipt, sendEmailUserInvoice, sendReceiptToUser } from "@/email/send";

export async function editInvoice(formData, invoiceId) {
	const authSession = await auth();

	if (!authorize(authSession, [s.management])) return { ok: false, message: "Unauthorized" };

	const schema = z.object({
		description: z.string().trim().min(1).max(100).transform(entityCase),
		items: z
			.string()
			.transform((value) => JSON.parse(value))
			.pipe(
				z.array(
					z.object({
						description: z
							.string()
							.trim()
							.min(1)
							.max(100)
							// Replace .toUpperCase() with a transform callback:
							.transform((val) => val.toUpperCase()),
						price: z.number().min(0.01).max(999999.99),
						quantity: z.number().int().min(1),
						priceLocked: z.boolean().optional(),
						quantityLocked: z.boolean().optional(),
						descriptionLocked: z.boolean().optional(),
					})
				)
			)
			.transform(async (value) => {
				const selectedSession = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { session: true } });
				if (!selectedSession) return value;
				const delegateFee = selectedSession.session.delegatePrice;
				const directorFee = selectedSession.session.directorPrice;
				return value.map((item) => {
					if (item.description === "DELEGATE FEE") {
						return {
							...item,
							price: delegateFee,
							priceLocked: true,
							quantityLocked: false,
							descriptionLocked: true,
						};
					}
					if (item.description === "SCHOOL DIRECTOR FEE") {
						return {
							...item,
							price: directorFee,
							priceLocked: true,
							quantityLocked: false,
							descriptionLocked: true,
						};
					}
					return item;
				});
			}),
		date: z.string().transform((value) => new Date(value).toISOString()),
		dueDate: z
			.string()
			.transform((value) => new Date(value).toISOString())
			.optional()
			.nullable(),
		isPaid: z.boolean(),
		notify: z
			.enum(["on", "off"])
			.transform((value) => value === "on")
			.optional(),
	});

	const parsedFormData = parseFormData(formData);

	const { data, error } = await schema.safeParseAsync(parsedFormData);

	if (error) return { ok: false, message: "Invalid data" };

	const originalInvoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { school: true } });

	if (!originalInvoice) return { ok: false, message: ["Invoice not found"] };

	if (originalInvoice.isPaid && data.notify) return { ok: false, message: ["Invoice is already paid, cannot notify again."] };

	const parsedOriginalItems = JSON.parse(originalInvoice.items);

	if (
		parsedOriginalItems.some((item) => {
			if (item.priceLocked) return item.price !== data.items.find((i) => i.description === item.description)?.price;
			if (item.quantityLocked) return item.quantity !== data.items.find((i) => i.description === item.description)?.quantity;
			if (item.descriptionLocked) return item.description !== data.items.find((i) => i.description === item.description)?.description;
			return false;
		})
	)
		return { ok: false, message: ["You cannot change locked items"] };

	try {
		await prisma.invoice.update({
			where: { id: invoiceId },
			data: {
				description: data.description,
				items: JSON.stringify(sortItems(data.items)),
				date: data.date,
				dueDate: data.dueDate,
				isPaid: data.isPaid,
			},
		});
	} catch (e) {
		if (e.code === "P2002") return { ok: false, message: "Invoice short name and slug must be unique." };
		return { ok: false, message: "An error occurred while updating the invoice." };
	}

	if (data.notify && originalInvoice.schoolId) {
		if (originalInvoice.school?.name) {
			try {
				const schoolDirectors = await prisma.schoolDirector.findMany({
					where: {
						schoolId: originalInvoice.schoolId,
						session: { isCurrent: true },
					},
					include: {
						user: true,
					},
				});

				const usersToNotify = schoolDirectors.map(({ user }) => ({
					email: user.email,
					displayName: user.displayName || `${user.officialName} ${user.officialSurname}`,
				}));

				const emailPromises = usersToNotify.map(({ email, displayName }) =>
					sendEmailSchoolReceipt({
						email,
						schoolName: originalInvoice.school.name,
						officialName: displayName,
					})
				);

				await Promise.all(emailPromises);
			} catch (err) {
				return { ok: true, message: "Invoice updated, but failed to send email." };
			}
		}

		if (originalInvoice.userId) {
			try {
				const userToNotify = await prisma.user.findUnique({
					where: { id: originalInvoice.userId },
					omit: { signature: true },
				});

				if (!userToNotify) {
					return { ok: false, message: ["User not found"] };
				}

				await sendReceiptToUser({
					email: userToNotify.email,
					officialName: userToNotify.displayName || `${userToNotify.officialName} ${userToNotify.officialSurname}`,
				});
			} catch (err) {
				return { ok: true, message: "Invoice updated, but failed to send email." };
			}
		}
	}

	return { ok: true, message: [`Invoice updated successfully ${data.notify ? "and email sent." : ""}`] };
}

export async function deleteInvoice(invoiceId) {
	const authSession = await auth();

	if (!authorize(authSession, [s.management])) return { ok: false, message: "Unauthorized" };

	const selectedInvoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { session: true } });

	if (!selectedInvoice) return { ok: false, message: ["Invoice not found"] };

	try {
		await prisma.invoice.delete({ where: { id: invoiceId } });
	} catch (e) {
		return { ok: false, message: ["An error occurred while deleting the invoice."] };
	}
	return { ok: true, message: ["Invoice deleted"] };
}

export async function addInvoice(formData: FormData) {
	const authSession = await auth();

	if (!authSession || !authorize(authSession, [s.management])) return { ok: false, message: "Unauthorized" };

	const schema = z.object({
		description: z.string().trim().min(1).max(100).toUpperCase(),
		schoolId: z.string().optional().nullable(),
		userId: z.string().optional().nullable(),
		sessionNumber: z.string(),
		invoiceNotify: z
			.string()
			.optional()
			.transform((value) => value === "on"),
		isPaid: z.boolean(),
		receiptNotify: z
			.enum(["on", "off"])
			.transform((value) => value === "on")
			.optional()
			.nullable(),
		items: z
			.string()
			.transform((value) => JSON.parse(value))
			.pipe(
				z.array(
					z.object({
						description: z
							.string()
							.trim()
							.min(1)
							.max(100)
							// Replace .toUpperCase() with a transform callback:
							.transform((val) => val.toUpperCase()),
						price: z.number().min(0.01).max(999999.99),
						quantity: z.number().int().min(1),
						priceLocked: z.boolean().optional(),
						quantityLocked: z.boolean().optional(),
						descriptionLocked: z.boolean().optional(),
					})
				)
			),
	});

	const parsedFormData = parseFormData(formData);

	const { data, error } = await schema.safeParseAsync(parsedFormData);
	if (error) return { ok: false, message: "Invalid data." };

	const selectedSession = await prisma.session.findUnique({ where: { number: data.sessionNumber } });

	if (!selectedSession) return { ok: false, message: ["Invalid session"] };

	if (data.schoolId) {
		const selectedSchool = await prisma.school.findUnique({ where: { id: data.schoolId } });

		if (!selectedSchool) return { ok: false, message: ["Invalid school"] };
	}

	if (data.userId) {
		const selectedUser = await prisma.user.findUnique({ where: { id: data.userId }, omit: { signature: true } });

		if (!selectedUser) return { ok: false, message: ["Invalid user"] };
	}

	let returnedData;

	try {
		returnedData = await prisma.invoice.create({
			data: {
				description: data.description,
				isPaid: data.isPaid,
				...(data.schoolId && { school: { connect: { id: data.schoolId } } }),
				...(data.userId && { user: { connect: { id: data.userId } } }),
				session: { connect: { number: data.sessionNumber } },
				items: JSON.stringify(sortItems(data.items)),
			},
			select: {
				user: { select: { email: true, officialName: true, officialSurname: true } },
				school: {
					select: {
						name: true,
						director: {
							where: { session: { isCurrent: true } },
							select: { user: { select: { email: true, officialName: true, officialSurname: true, displayName: true } } },
						},
					},
				},
			},
		});
	} catch (error) {
		return { ok: false, message: ["Failed to create invoice"] };
	}

	if (data.invoiceNotify) {
		if (data.schoolId) {
			try {
				const schoolDirectors = await prisma.schoolDirector.findMany({
					where: { schoolId: data.schoolId, session: { isCurrent: true } },
					include: { user: true },
				});

				const usersToNotify = schoolDirectors.map(({ user }) => ({
					email: user.email,
					displayName: user.displayName || `${user.officialName} ${user.officialSurname}`,
				}));

				const emailPromises = usersToNotify.map(({ email, displayName }) =>
					sendEmailSchoolInvoice({
						email,
						schoolName: returnedData.school.name,
						officialName: displayName,
					})
				);

				await Promise.all(emailPromises);
			} catch (err) {
				return { ok: true, message: "Invoice created, but failed to send email." };
			}
		}

		if (data.userId) {
			try {
				await sendEmailUserInvoice({
					email: returnedData.user.email,
					officialName: returnedData.user.displayName || `${returnedData.user.officialName} ${returnedData.user.officialSurname}`,
				});
			} catch (err) {
				return { ok: true, message: "Invoice created, but failed to send email." };
			}
		}
	}

	if (data.receiptNotify) {
		if (!!returnedData.school?.director?.length) {
			try {
				const directors = returnedData.school.director;
				const directorPromises = directors.map((director) => {
					const { email, displayName, officialName, officialSurname } = director.user;
					return sendEmailSchoolReceipt({
						email,
						schoolName: returnedData.school.name,
						officialName: displayName || `${officialName} ${officialSurname}`,
					});
				});

				await Promise.all(directorPromises);
			} catch (err) {
				return { ok: true, message: "Invoice created, but failed to send email" };
			}
		}

		if (returnedData.user?.email) {
			try {
				await sendReceiptToUser({
					email: returnedData.user.email,
					officialName: returnedData.user.displayName || `${returnedData.user.officialName} ${returnedData.user.officialSurname}`,
				});
			} catch (err) {
				return { ok: true, message: "Invoice created, but failed to send email." };
			}
		}
	}

	return { ok: true, message: ["Invoice created successfully"] };
}

export async function getSchools(query) {
	const authSession = await auth();

	if (!authorize(authSession, [s.management])) return { ok: false, message: ["Unauthorized"] };

	const schools = await prisma.school.findMany({
		where: {
			OR: [{ name: { contains: query, mode: "insensitive" } }, { id: { contains: query, mode: "insensitive" } }, { slug: { contains: query, mode: "insensitive" } }],
		},
		take: 15,
		select: {
			id: true,
			name: true,
		},
	});

	return { ok: true, message: ["Schools fetched successfully"], data: schools };
}

export async function getUsers(query) {
	const authSession = await auth();

	if (!authorize(authSession, [s.management])) return { ok: false, message: ["Unauthorized"] };

	const users = await prisma.user.findMany({
		where: {
			OR: [
				{ officialName: { contains: query, mode: "insensitive" } },
				{ officialSurname: { contains: query, mode: "insensitive" } },
				{ displayName: { contains: query, mode: "insensitive" } },
				{ id: { contains: query, mode: "insensitive" } },
				{ email: { contains: query, mode: "insensitive" } },
				{ phoneNumber: { contains: query, mode: "insensitive" } },
			],
		},
		take: 15,
		select: {
			id: true,
			displayName: true,
			officialName: true,
			officialSurname: true,
		},
	});

	return { ok: true, message: ["Users fetched successfully"], data: users };
}
