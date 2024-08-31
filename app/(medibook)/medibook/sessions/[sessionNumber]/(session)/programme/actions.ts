"use server";

import { s, authorize } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { auth } from "@/auth";

export async function addDay(formData) {
	const session = await auth();
	if (!session || !authorize(session, [s.management])) return { ok: false, title: "Not authorized" };

	const rawData = Object.fromEntries(formData);
	const data = Object.keys(rawData).reduce((acc, key) => {
		if (rawData[key] === "null") {
			acc[key] = null;
		} else if (rawData[key] === "undefined") {
			acc[key] = undefined;
		} else {
			acc[key] = rawData[key];
		}
		return acc;
	}, {}) as any;

	const loc = data?.locationId
		? {
				location: {
					connect: {
						id: data.locationId,
					},
				},
		  }
		: null;

	try {
		if (data.id) {
			await prisma.day.update({
				where: {
					id: data.id,
				},
				data: {
					date: new Date(data.date),
					type: data.type,
					name: data.name,
					description: data.description,
					location: data?.locationId
						? {
								connect: { id: data.locationId },
						  }
						: { disconnect: true },
				},
			});
		} else {
			await prisma.day.create({
				data: {
					date: new Date(data.date),
					type: data.type,
					name: data.name,
					description: data.description,
					session: {
						connect: {
							id: data.sessionId,
						},
					},
					...loc,
				},
			});
		}
	} catch (e) {
		return { ok: false, title: "Error completing operation." };
	}

	return { ok: true, title: "Day successfullly created." };
}

export async function deleteDay(dayId) {
	const session = await auth();
	if (!session || !authorize(session, [s.sd, s.admins])) return { ok: false, title: "Not authorized" };

	try {
		await prisma.day.delete({
			where: {
				id: dayId,
			},
		});
	} catch {
		return { ok: false, title: "Error deleting day." };
	}

	return { ok: true, title: "Day deleted." };
}
