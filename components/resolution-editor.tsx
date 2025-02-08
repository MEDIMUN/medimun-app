"use client";

import { useState, useCallback, useEffect } from "react";
import { useSocket } from "@/contexts/socket";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Clause, ClauseType } from "@/types/socket-events";
import { PreambulatoryPhrases, OperativePhrases } from "@/types/socket-events";
import NotConnectedState from "@/components/NotConnectedState";
import { Badge } from "@/components/badge";
import { AutoRefresh } from "./auto-refresh";
import { ClauseEditor } from "./not-debounced-clause-editor";

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

	const handleClauseUpdate = (type: ClauseType, updatedClause: Clause, updateType: "edit" | "reorder" | "delete") => {
		// Emit the update to the server

		//update local state
		const setClausesFunction = type === "preambulatory" ? setPreambutoryClauses : setOperativeClauses;
		setClausesFunction((prevClauses) => {
			let updatedClauses: Clause[];

			switch (updateType) {
				case "edit":
					updatedClauses = prevClauses.map((clause) => (clause.id === updatedClause.id ? { ...clause, ...updatedClause } : clause));
					break;
				case "reorder":
					updatedClauses = prevClauses.map((clause) => (clause.id === updatedClause.id ? { ...clause, ...updatedClause } : clause));
					updatedClauses.sort((a, b) => a.index - b.index);
					break;
				case "delete":
					updatedClauses = prevClauses.filter((clause) => clause.id !== updatedClause.id);
					updatedClauses.forEach((clause, index) => {
						clause.index = index + 1;
					});
					break;
				default:
					updatedClauses = prevClauses;
			}

			return updatedClauses;
		});

		if (socket && isConnected) {
			socket.emit("clause:update", {
				type,
				clause: updatedClause,
				updateType,
			});
		}
	};

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
				<AutoRefresh interval={10000} />
				<div className="font-serif text-base">
					<div className="mb-8 p-4 bg-sidebar-accent rounded-md">
						<h2 className="text-lg font-[montserrat] mb-4">Preambulatory Clauses ({preambutoryClauses.length})</h2>
						<ClauseEditor
							hideSubClauses
							clauses={preambutoryClauses}
							onUpdate={(clause, updateType) => handleClauseUpdate("preambulatory", clause, updateType)}
							onDelete={(clauseId) => handleClauseDelete("preambulatory", clauseId)}
							phrases={Object.values(PreambulatoryPhrases)}
							type="preambulatory"
						/>
						<Button onClick={() => addClause("preambulatory")} className="rounded-full" variant={"outline"}>
							Add Preambulatory Clause
						</Button>
					</div>
					<div className="mt-8 pt-4 rounded-md bg-sidebar-accent p-4">
						<h2 className="text-lg font-[montserrat] mb-4">Operative Clauses ({operativeClauses.length})</h2>
						<ClauseEditor
							clauses={operativeClauses}
							onUpdate={(clause, updateType) => handleClauseUpdate("operative", clause, updateType)}
							onDelete={(clauseId) => handleClauseDelete("operative", clauseId)}
							phrases={Object.values(OperativePhrases)}
							type="operative"
						/>
						<Button onClick={() => addClause("operative")} className="rounded-full" variant={"outline"}>
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
