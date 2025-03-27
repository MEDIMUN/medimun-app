"use server";

import { parseFormData } from "@/lib/parse-form-data";
import { z } from "zod";
import { auth } from "@/auth";
import { authorize, authorizeChairCommittee, authorizeDelegateCommittee, authorizeManagerDepartment, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import OpenAI from "openai";
/* @ts-ignore */
import { minio } from "@/minio/client";
import mimeExt from "mime-ext";
import { entityCase } from "@/lib/text";
import { redirect } from "next/navigation";

export async function createMediWriteResolution(formData: FormData) {
	const authSession = await auth();

	const resolutionSchema = z.object({
		title: z.string().trim().max(100).transform(entityCase),
	});

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	const parsedFormData = parseFormData(formData) as any;
	const processResolutionText = parsedFormData.processResolution.trim();

	const { data, error } = resolutionSchema.safeParse(parsedFormData);
	if (error) return { ok: false, message: ["Invalid title."] };

	const selectedCommittee = await prisma.committee.findUnique({
		where: { id: parsedFormData?.committeeId },
		include: { session: true },
	});

	if (!selectedCommittee) return { ok: false, message: ["Could not find committee."] };

	const selectedTopic = await prisma.topic.findUnique({
		where: { id: parsedFormData?.topicId },
	});

	if (!selectedTopic) return { ok: false, message: ["Could not find topic."] };

	const isManagement = authorize(authSession, [s.management]);
	const isChair = authorizeChairCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedCommittee.id);
	const isDelegate = authorizeDelegateCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedCommittee.id);
	const isSessionCurrent = selectedCommittee.session.isCurrent;

	const isAllowedToAddResolution = ((isChair || isDelegate) && isSessionCurrent) || isManagement;
	if (!isAllowedToAddResolution) return { ok: false, message: ["You can't submit resolutions"] };

	if (!processResolutionText) {
		try {
			await prisma.resolution.create({
				data: {
					topic: { connect: { id: selectedTopic.id } },
					mainSubmitter: {
						connect: {
							userId_committeeId: {
								userId: authSession.user.id,
								committeeId: selectedCommittee.id,
							},
						},
					},
					committee: {
						connect: { id: selectedCommittee.id },
					},
					title: data.title,
				},
			});
		} catch (e) {
			return {
				ok: false,
				message: ["Error creating resolution."],
			};
		}
	} else {
		let createdResolution;
		try {
			createdResolution = await prisma.resolution.create({
				data: {
					topic: { connect: { id: selectedTopic.id } },
					mainSubmitter: {
						connect: {
							userId_committeeId: {
								userId: authSession.user.id,
								committeeId: selectedCommittee.id,
							},
						},
					},
					committee: {
						connect: { id: selectedCommittee.id },
					},
					title: data.title,
				},
			});
		} catch (e) {
			return {
				ok: false,
				message: ["Error creating resolution."],
			};
		}

		const openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});

		let processedResolution;

		try {
			processedResolution = await openai.responses.create({
				model: "gpt-4o-mini",
				input: [
					{
						role: "system",
						content: [
							{
								type: "input_text",
								text: 'The input text is a whole MUN resolution given as single text with preambulatory clauses at the beginning listed one by one and operative clauses listed after.\nEach operative clause may have sub clauses.\nEach sub clause may have sub sub clauses.\nYou create a single JSON as output.\nThe JSON has two keys: preambulatoryClauses and operativeClauses\npreambulatoryClauses is an array minimum length is 0.\noperativeClauses is an array minimum length is 0.\n\neach object in preambulatoryClauses has the keys: index (starting from 1, index of clause in preambulatory clauses), startingPhrase (the starting phrase of the clause turned into sentence case, such as "Acknowledging" or "Noting with deep concern", one of many standard MUN preambulatory clause starting phrases), body (rest of the body with starting phrase removed, and proper capitalization of a sentence abbreviations capitalized etc, the last punctuation mark at the end of body such as a comma, if any, needs to be removed.)\n\neach object in operativeClauses has the keys: index (starting from 1, index of clause in operative clauses), startingPhrase (the starting phrase of the clause turned into sentence case, such as "Requests" or "Further calls for", one of many standard MUN operative clause starting phrases), body (rest of the body with starting phrase removed, and proper capitalization of a sentence abbreviations capitalized etc, the last punctuation mark at the end of body such as a comma, if any, needs to be removed.), subClauses (array of min length 0, with keys content [the whole properly capitalized content of sub clause with the last punctuation mark, if any, removed subSubClauses (array with min length 0, with keys content [the whole properly capitalized content of sub clause with the last punctuation mark, if any, removed])])\nIf sub or sub sub clauses have numberings, bullets, etc, remove them but keep the order.\nThe index of preambulatoryClauses and operativeClauses is separate, each starts from 0.\nThe sub and sub sub clauses of operativeClauses do not have index values but should be ordered the same way as the input.\nif a preambulatoryClause has no subClauses the subClauses key should be [], if a subClause has no subSubClauses the subSubClauses key should be [].\nsubSubClauses only belong to subClauses. No operativeClauses does NOT directly have subSubClauses key. \n\nDo not change anything else other than mentioned.\nYou may only fix incorrectly written words if they are not in quotation marks.\nKeep everything else the same and output it in the requested JSON format.\nDo not modify the fundamentals of the input resolution other than mentioned.\nThe overall order of the resolution should be like the original input.\nThe output should always be a JSON with the given format. Even if the input does not fit the given format output format should always be the same.',
							},
						],
					},
					{
						role: "user",
						content: [
							{
								type: "input_text",
								text: processResolutionText,
							},
						],
					},
				],
				text: {
					format: {
						type: "json_object",
					},
				},
				reasoning: {},
				tools: [],
				temperature: 0,
				max_output_tokens: 16384,
				top_p: 1,
				store: true,
			});
		} catch (e) {
			return {
				ok: false,
				message: ["Error processing resolution."],
			};
		}

		const resolutionContent = processedResolution.output_text;

		const resolutionContentJSON = JSON.parse(resolutionContent);

		const preambulatoryClauses = resolutionContentJSON.preambulatoryClauses.map((clause: any) => {
			return {
				index: clause.index,
				startingPhrase: clause.startingPhrase,
				body: clause.body,
			};
		});

		const operativeClauses = resolutionContentJSON.operativeClauses.map((clause: any) => {
			return {
				index: clause.index,
				startingPhrase: clause.startingPhrase,
				body: clause.body,
				subClauses: JSON.stringify(clause.subClauses),
			};
		});

		try {
			await prisma.resolution.update({
				where: { id: createdResolution.id },
				data: {
					PreambulatoryClause: { create: preambulatoryClauses },
					OperativeClause: { create: operativeClauses },
				},
			});
		} catch (e) {
			await prisma.resolution.delete({
				where: { id: createdResolution.id },
			});
			return {
				ok: false,
				message: ["Error creating resolution."],
			};
		} finally {
			return {
				ok: true,
				message: "Resolution created.",
				data: `/medibook/sessions/${selectedCommittee.session.number}/committees/${selectedCommittee.slug || selectedCommittee.id}/resolutions/${createdResolution.id}`,
			};
		}
	}

	return { ok: true, message: "Resolution created." };
}

export async function deleteResolution(resolutionId: string) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	if (!authSession) return { ok: false, message: ["Not authorized"] };

	const selectedResolution = await prisma.resolution.findUnique({
		where: { id: resolutionId },
		include: { mainSubmitter: true, committee: true },
	});

	if (!selectedResolution) return { ok: false, message: ["Resolution not found."] };

	const selectedCommittee = selectedResolution.committee;

	const isChair = authorizeChairCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedCommittee.id);
	const isDelegate = authorizeDelegateCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedCommittee.id);

	if (
		!(
			(isDelegate && !isChair && !isManagement && selectedResolution?.status === "DRAFT" && selectedResolution.mainSubmitter.userId === authSession.user.id) ||
			(isChair && !isManagement && !!selectedResolution && ["DRAFT", "SENT_BACK_TO_COMMITTEE", "SENT_TO_CHAIRS", "IN_DEBATE", "VOTING"].includes(selectedResolution.status)) ||
			isManagement
		)
	) {
		return { ok: false, message: ["Not authorized."] };
	}
	//
	try {
		await prisma.resolution.delete({
			where: {
				id: resolutionId,
				...(isManagement ? {} : { status: "DRAFT" }),
				mainSubmitter: {
					userId: authSession.user.id,
				},
			},
		});
	} catch (e) {
		return { ok: false, message: ["Something went wrong."] };
	}

	return { ok: true, message: ["Resolution deleted."] };
}

//send to approval panel for approval
export async function sendResolutionToApproval(resolutionId: string) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	const selectedResolution = await prisma.resolution.findUnique({
		where: { id: resolutionId, status: "SENT_TO_CHAIRS" },
		include: { mainSubmitter: true, committee: true },
	});

	if (!selectedResolution) return { ok: false, message: ["Resolution not found."] };

	const selectedCommittee = selectedResolution.committee;

	const isChair = authorizeChairCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], selectedCommittee.id);
	const isManagement = authorize(authSession, [s.management]);

	if (!isChair && !isManagement) return { ok: false, message: ["Not authorized."] };

	try {
		await prisma.resolution.update({
			where: { id: resolutionId },
			data: { status: "SENT_TO_APPROVAL_PANEL", CoSubmitterInvitation: { deleteMany: {} } },
		});
	} catch (e) {
		return { ok: false, message: ["Something went wrong."] };
	}

	return { ok: true, message: ["Resolution sent for approval."] };
}
