"use server";

import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { auth } from "@/auth";
import { z } from "zod";
import { parseFormData } from "@/lib/parse-form-data";
import { entityCase, processSlug } from "@/lib/text";

const policySchema = z.object({
	id: z.string().optional().nullable(),
	title: z
		.string()
		.trim()
		.min(2, "Title must be at least 2 characters long")
		.max(50, "Title must be at most 50 characters long")
		.transform(entityCase),
	slug: z.string().trim().min(2, "Slug must be at least 2 characters long").max(50, "Slug must be at most 50 characters long").transform(processSlug),
	description: z
		.string()
		.trim()
		.min(2, "Description must be at least 2 characters long")
		.max(1000, "Description must be at most 1000 characters long")
		.optional()
		.nullable(),
	markdown: z.string().trim().min(2, "Markdown must be at least 2 characters long").max(10000, "Markdown must be at most 10000 characters long"),
});

export async function addPolicy(formData: FormData) {
	const authSession = await auth();
	if (!authorize(authSession, [s.director, s.sd])) return { ok: false, message: ["Unauthorized"] };
	const parsedData = parseFormData(formData);
	const { data, error } = policySchema.safeParse(parsedData);
	if (error) return { ok: false, message: ["Invalid Data."] };

	try {
		await prisma.policy.create({
			data: {
				title: data.title,
				slug: data.slug,
				description: data.description,
				markdown: data.markdown,
			},
		});
	} catch {
		return { ok: false, message: ["Something went wrong"] };
	}
	return { ok: true, message: ["Policy created"] };
}

export async function editPolicy(formData: FormData) {
	const authSession = await auth();
	if (!authorize(authSession, [s.director, s.sd])) return { ok: false, message: ["Unauthorized"] };
	const parsedData = parseFormData(formData);
	const { data, error } = policySchema.safeParse(parsedData);
	if (error || !data.id) return { ok: false, message: ["Invalid Data."] };

	try {
		await prisma.policy.update({
			where: { id: data.id },
			data: {
				title: data.title,
				slug: data.slug,
				description: data.description,
				markdown: data.markdown,
			},
		});
	} catch {
		return { ok: false, message: ["Something went wrong"] };
	}
	return { ok: true, message: ["Policy updated"] };
}

export async function deletePolicy(policyId) {
	const authSession = await auth();
	if (!authorize(authSession, [s.director, s.sd])) return { ok: false, message: ["Unauthorized"] };

	try {
		await prisma.policy.delete({ where: { id: policyId } });
	} catch {
		return { ok: false, message: ["Something went wrong"] };
	}
	return { ok: true, message: ["Policy deleted"] };
}
