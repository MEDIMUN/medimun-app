"use client";

import { useState, useCallback, useEffect } from "react";
import { ClauseEditor } from "./clause-editor";
import { useSocket } from "@/contexts/socket";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Clause, ClauseType } from "@/types/socket-events";
import { PreambulatoryPhrases, OperativePhrases } from "@/types/socket-events";
import NotConnectedState from "@/components/NotConnectedState";
import { Badge } from "@/components/badge";

interface ResolutionEditorProps {
	initialPreambutoryClauses: Clause[];
	initialOperativeClauses: Clause[];
	resolutionId: string;
	title: string;
}

export function ResolutionEditor({ initialPreambutoryClauses, initialOperativeClauses, resolutionId, title: initialTitle }: ResolutionEditorProps) {
	const [preambutoryClauses, setPreambutoryClauses] = useState<Clause[]>(initialPreambutoryClauses);
	const [operativeClauses, setOperativeClauses] = useState<Clause[]>(initialOperativeClauses);
	const { socket, isConnected } = useSocket();

	useEffect(() => {
		if (socket && isConnected) {
			socket.emit("join-resolution", resolutionId);

			socket.on("error", (error: { message: string; error: string }) => {
				toast.error(error.message);
			});

			socket.on("clause:updated", (event) => {
				const setClausesFunction = event.type === "preambulatory" ? setPreambutoryClauses : setOperativeClauses;
				setClausesFunction((prevClauses) => {
					let updatedClauses: Clause[];

					switch (event.updateType) {
						case "edit":
							updatedClauses = prevClauses.map((clause) => (clause.id === event.clause.id ? { ...clause, ...event.clause } : clause));
							break;
						case "reorder":
							updatedClauses = prevClauses.map((clause) => (clause.id === event.clause.id ? { ...clause, ...event.clause } : clause));
							updatedClauses.sort((a, b) => a.index - b.index);
							break;
						case "delete":
							updatedClauses = prevClauses.filter((clause) => clause.id !== event.clause.id);
							updatedClauses.forEach((clause, index) => {
								clause.index = index + 1;
							});
							break;
						default:
							updatedClauses = prevClauses;
					}

					return updatedClauses;
				});
			});

			socket.on("clause:created", (event) => {
				const setClausesFunction = event.type === "preambulatory" ? setPreambutoryClauses : setOperativeClauses;
				setClausesFunction((prev) => {
					const updatedClauses = [...prev, event.clause];
					return updatedClauses.sort((a, b) => a.index - b.index);
				});
			});

			return () => {
				socket.off("clause:updated");
				socket.off("clause:created");
				socket.off("error");
			};
		}
	}, [socket, isConnected, resolutionId]);

	const handleClauseUpdate = useCallback(
		(type: ClauseType, updatedClause: Clause, updateType: "edit" | "reorder" | "delete") => {
			// Emit the update to the server
			if (socket && isConnected) {
				socket.emit("clause:update", {
					type,
					clause: updatedClause,
					updateType,
				});
			}
		},
		[socket, isConnected]
	);

	const handleClauseDelete = useCallback(
		(type: ClauseType, clauseId: string) => {
			if (socket && isConnected) {
				socket.emit("clause:update", {
					type,
					clause: { id: clauseId, resolutionId },
					updateType: "delete",
				});
			}
		},
		[socket, isConnected, resolutionId]
	);

	const addClause = useCallback(
		(type: ClauseType) => {
			const phrases = type === "preambulatory" ? PreambulatoryPhrases : OperativePhrases;

			const newClause: Omit<Clause, "id"> = {
				index: -1, // Temporary index, will be set by the server
				startingPhrase: Object.values(phrases)[0],
				body: "",
				subClauses: [],
				resolutionId: resolutionId,
			};

			if (socket && isConnected) {
				socket.emit("clause:create", {
					type,
					clause: newClause,
					resolutionId,
				});
			}
		},
		[resolutionId, socket, isConnected]
	);

	if (isConnected)
		return (
			<>
				<div className="font-serif text-base">
					<div className="mb-6 p-2 bg-primary text-white rounded-md">
						Editing the same clause simultaneously may cause conflicts. This feature is currently being tested, resolutions written before February 7,
						2025 at 8 AM may be deleted during the testing process.
					</div>
					<div className="mb-8">
						<h2 className="text-2xl font-[montserrat] font-bold mb-4">
							Preambulatory Clauses <Badge className="!text-2xl"> {preambutoryClauses.length} </Badge>
						</h2>
						<ClauseEditor
							hideSubClauses
							clauses={preambutoryClauses}
							onUpdate={(clause, updateType) => handleClauseUpdate("preambulatory", clause, updateType)}
							onDelete={(clauseId) => handleClauseDelete("preambulatory", clauseId)}
							phrases={Object.values(PreambulatoryPhrases)}
							type="preambulatory"
						/>
						<Button onClick={() => addClause("preambulatory")} className="mt-4 text-sm" size="sm">
							Add Preambulatory Clause
						</Button>
					</div>
					<div className="mt-8 pt-8 border-t border-gray-300">
						<h2 className="text-2xl font-[montserrat] font-bold mb-4">
							Operative Clauses <Badge className="!text-2xl"> {operativeClauses.length} </Badge>
						</h2>
						<ClauseEditor
							clauses={operativeClauses}
							onUpdate={(clause, updateType) => handleClauseUpdate("operative", clause, updateType)}
							onDelete={(clauseId) => handleClauseDelete("operative", clauseId)}
							phrases={Object.values(OperativePhrases)}
							type="operative"
						/>
						<Button onClick={() => addClause("operative")} className="mt-4 text-sm" size="sm">
							Add Operative Clause
						</Button>
					</div>
				</div>
			</>
		);

	return (
		<div>
			<NotConnectedState />
		</div>
	);
}
