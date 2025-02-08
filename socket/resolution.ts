import type { Server, Socket } from "socket.io";
import prisma from "@/prisma/client";
import type { ClauseUpdateEvent } from "@/types/socket-events";
import type { Clause, ClauseType } from "@/types/clause";
import { socketAuth } from "./auth";
import { Prisma } from "@prisma/client";
import { canEditResolution } from "@/lib/resolution-open-mode";

export function handleJoinResolution(socket: Socket, resolutionId: string) {
	socket.join(resolutionId);
	console.log(`Client ${socket.id} joined resolution ${resolutionId}`);
}

type resolutionType = Prisma.ResolutionGetPayload<{
	include: {
		CoSubmitters: {
			include: {
				delegate: {
					include: {
						user: true;
					};
				};
			};
		};
		editor: {
			include: {
				user: true;
			};
		};
		mainSubmitter: {
			include: {
				user: true;
			};
		};
		committee: true;
	};
}>;

export async function handleCreateClause(io: Server, socket: Socket, event: { type: ClauseType; clause: Omit<Clause, "id">; resolutionId: string }) {
	try {
		const prismaModel = event.type === "preambulatory" ? prisma.preambulatoryClause : prisma.operativeClause;
		const authSession = await socketAuth(socket);
		if (!authSession) {
			socket.emit("error", {
				message: "Unauthorized",
			});
			return;
		}

		const selectedResolution = await prisma.resolution.findFirst({
			where: { id: event.resolutionId },
			include: {
				CoSubmitters: { include: { delegate: { include: { user: true } } } },
				editor: { include: { user: true } },
				mainSubmitter: { include: { user: true } },
				committee: true,
			},
		});

		if (!selectedResolution) {
			socket.emit("error", {
				message: "Resolution not found",
			});
			return;
		}

		if (!(canEditResolution(authSession, selectedResolution) === "EDIT")) {
			socket.emit("error", {
				message: "Unauthorized",
			});
			return;
		}

		const maxIndexClause = await prismaModel.findFirst({
			where: { resolutionId: event.resolutionId },
			orderBy: { index: "desc" },
		});

		const newIndex = maxIndexClause ? maxIndexClause.index + 1 : 1;

		const createdClause = await prismaModel.create({
			data: {
				startingPhrase: event.clause.startingPhrase,
				body: event.clause.body,
				subClauses: JSON.stringify(event.clause.subClauses),
				resolutionId: event.resolutionId,
				index: newIndex,
			},
		});

		const createdClauseWithId: Clause = {
			...event.clause,
			id: createdClause.id,
			index: newIndex,
		};

		io.to(event.resolutionId).emit("clause:created", {
			type: event.type,
			clause: createdClauseWithId,
		});
	} catch (error) {
		console.error("Error creating clause:", error);
		socket.emit("error", {
			message: "Failed to create clause",
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}

export async function handleUpdateClause(io: Server, socket: Socket, event: ClauseUpdateEvent) {
	try {
		const prismaModel = event.type === "preambulatory" ? prisma.preambulatoryClause : prisma.operativeClause;

		if (!event.clause.id) {
			console.error("Received update for clause without ID");
			return;
		}

		const authSession = await socketAuth(socket);

		if (!authSession) {
			socket.emit("error", {
				message: "Unauthorized",
			});
			return;
		}

		const selectedResolution = await prisma.resolution.findFirst({
			where: { id: event.clause.resolutionId },
			include: {
				CoSubmitters: { include: { delegate: { include: { user: true } } } },
				editor: { include: { user: true } },
				mainSubmitter: { include: { user: true } },
				committee: true,
			},
		});

		if (!selectedResolution) {
			socket.emit("error", {
				message: "Resolution not found",
			});
			return;
		}

		if (!(canEditResolution(authSession, selectedResolution) === "EDIT")) {
			socket.emit("error", {
				message: "Unauthorized",
			});
			return;
		}

		// Then update the database
		switch (event.updateType) {
			case "edit":
				socket.to(event.clause.resolutionId).emit("clause:updated", {
					type: event.type,
					clause: event.clause,
					updateType: event.updateType,
				});
				await prismaModel.update({
					where: { id: event.clause.id },
					data: {
						startingPhrase: event.clause.startingPhrase,
						body: event.clause.body,
						subClauses: JSON.stringify(event.clause.subClauses),
					},
				});

				break;

			case "reorder":
				await prisma.$transaction(async (tx) => {
					const clauses = await tx[event.type === "preambulatory" ? "preambulatoryClause" : "operativeClause"].findMany({
						where: { resolutionId: event.clause.resolutionId },
						orderBy: { index: "asc" },
					});

					for (let i = 0; i < clauses.length; i++) {
						await tx[event.type === "preambulatory" ? "preambulatoryClause" : "operativeClause"].update({
							where: { id: clauses[i].id },
							data: { index: i + 1 },
						});
					}
				});
				io.to(event.clause.resolutionId).emit("clause:updated", {
					type: event.type,
					clause: event.clause,
					updateType: event.updateType,
				});
				break;

			case "delete":
				await prismaModel.delete({
					where: { id: event.clause.id },
				});
				// Update indices after deletion
				await prisma.$transaction(async (tx) => {
					const remainingClauses = await tx[event.type === "preambulatory" ? "preambulatoryClause" : "operativeClause"].findMany({
						where: { resolutionId: event.clause.resolutionId },
						orderBy: { index: "asc" },
					});
					for (let i = 0; i < remainingClauses.length; i++) {
						await tx[event.type === "preambulatory" ? "preambulatoryClause" : "operativeClause"].update({
							where: { id: remainingClauses[i].id },
							data: { index: i + 1 },
						});
					}
				});
				io.to(event.clause.resolutionId).emit("clause:updated", {
					type: event.type,
					clause: event.clause,
					updateType: event.updateType,
				});
				break;
		}
	} catch (error) {
		console.error("Error handling clause update:", error);
		socket.emit("error", {
			message: "Failed to update clause",
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}
