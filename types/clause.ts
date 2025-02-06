import type { OperativePhrases, PreambulatoryPhrases, SubClause } from "./socket-events";

export type ClauseType = "preambulatory" | "operative";

export interface Clause {
	id?: string;
	index: number;
	startingPhrase: PreambulatoryPhrases | OperativePhrases;
	body: string;
	subClauses: SubClause[];
	resolutionId: string;
}
