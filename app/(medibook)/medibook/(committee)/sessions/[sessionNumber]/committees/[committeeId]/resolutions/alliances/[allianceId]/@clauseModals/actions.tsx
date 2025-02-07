"use server";

import { auth } from "@/auth";
import prisma from "@/prisma/client";
import { Prisma } from "@prisma/client";

export async function createScClause({ clause, allianceId, type, mainSubmitterId }: { clause: any; allianceId: string; type: "PREAMBULATORY" | "OPERATIVE"; mainSubmitterId: any }) {
	try {
		const authSession = await auth();

		if (!authSession) return { ok: false, message: ["You are not authorized to perform this action"] };

		if (!clause) return { ok: false, message: ["Clause not found"] };

		const selectedAlliance = await prisma.alliance.findFirst({
			where: {
				id: allianceId,
				committee: {
					delegate: { some: { userId: authSession.user.id } },
					OR: [{ delegate: { some: { userId: authSession.user.id } } }, { chair: { some: { userId: authSession.user.id } } }],
				},
			},
			include: {
				topic: true,
				committee: { select: { ExtraCountry: true } },
				AllianceMember: { include: { delegate: { include: { user: true } } } },
				mainSubmitter: { include: { user: true } },
			},
		});
		if (!selectedAlliance) return { ok: false, message: ["Alliance not found"] };
		if (type === "PREAMBULATORY") {
			const newClause = await prisma.preambulatoryClause.create({
				data: {
					body: clause.body,
					startingPhrase: clause.startingPhrase,
					subClauses: JSON.stringify(clause.subClauses),
					mainSubmitter: { connect: { id: mainSubmitterId } },
					alliance: { connect: { id: allianceId } },
				},
			});
			if (!newClause) return { ok: false, message: ["Failed to create clause"] };
		}

		if (type === "OPERATIVE") {
			const newClause = await prisma.operativeClause.create({
				data: {
					body: clause.body,
					startingPhrase: clause.startingPhrase,
					subClauses: JSON.stringify(clause.subClauses),
					alliance: { connect: { id: allianceId } },
				},
			});
			if (!newClause) return { ok: false, message: ["Failed to create clause"] };
		}

		if (!allianceId) return { ok: false, message: ["Alliance not found"] };
	} catch (error) {
		return { ok: false, message: ["Failed to create clause"] };
	}

	return { ok: true, message: ["Clause created"] };
}
