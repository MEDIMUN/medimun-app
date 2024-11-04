"use server";

import prisma from "@/prisma/client";
import { s, authorize } from "@/lib/authorize";
import { auth } from "@/auth";
import { z } from "zod";
import { entityCase, processSlug } from "@/lib/text";
import { parseFormData } from "@/lib/parse-form-data";

export async function editDepartment(formData: FormData, departmentId) {
	const schema = z.object({
		name: z.string().trim().min(3).max(100).transform(entityCase),
		shortName: z.string().trim().min(2).max(4).toUpperCase().optional().nullable(),
		type: z
			.array(
				z.enum([
					"APPROVAL",
					"CATERING",
					"FUNDING",
					"ADVERTISING",
					"IT",
					"SALES",
					"GRAPHIC",
					"SOCIAL",
					"PHOTO",
					"MEDINEWS",
					"PI",
					"PREP",
					"ADMINSTAFF",
					"DATA",
					"OTHER",
				])
			)
			.default(["OTHER"]),
		isVisible: z.boolean(),
		slug: z.string().optional().nullable().transform(processSlug),
	});

	const authSession = await auth();

	if (!authorize(authSession, [s.management])) return { ok: false, message: "Unauthorized" };

	const parsedFormData = parseFormData(formData);

	const { type, ...otherDeptParsedData } = parsedFormData;

	const selectedDepartment = await prisma.department.findUnique({ where: { id: departmentId } });

	if (!selectedDepartment) return { ok: false, message: "Department not found" };

	const { data, error } = schema.safeParse({
		...otherDeptParsedData,
		type: type?.split(","),
	});
	if (error) return { ok: false, message: "Invalid data" };

	try {
		await prisma.department.update({
			where: {
				id: departmentId,
			},
			data: data,
		});
	} catch (e) {
		return { ok: false, message: "An error occurred while updating the department." };
	}

	return { ok: true, message: "Department updated" };
}
