"use client";

import { SearchParamsButton } from "@/app/(medibook)/medibook/client-components";
import { Badge } from "@/components/badge";
import { ClauseEditor } from "@/components/clause-editor";
import { Button } from "@/components/ui/button";
import { OperativePhrases, PreambulatoryPhrases } from "@prisma/client";

export function ScClauseEditor() {
	return (
		<div className="font-serif text-base">
			<div className="mb-8">
				<h2 className="text-2xl font-[montserrat] font-bold mb-4">
					Preambulatory Clauses <Badge className="!text-2xl"> {[].length} </Badge>
				</h2>
				<ClauseEditor hideSubClauses clauses={[]} onUpdate={() => {}} onDelete={() => {}} phrases={Object.values(PreambulatoryPhrases)} type="preambulatory" />
				<SearchParamsButton searchParams={{ "add-preambulatory-clause":  }} >
					Add Preambulatory Clause
				</SearchParamsButton>
			</div>
			<div className="mt-8 pt-8 border-t border-gray-300">
				<h2 className="text-2xl font-[montserrat] font-bold mb-4">
					Operative Clauses <Badge className="!text-2xl"> {[].length} </Badge>
				</h2>
				<ClauseEditor clauses={[]} onUpdate={() => {}} onDelete={() => {}} phrases={Object.values(OperativePhrases)} type="operative" />
				<Button onClick={() => {}} className="mt-4 text-sm" size="sm">
					Add Operative Clause
				</Button>
			</div>
		</div>
	);
}
