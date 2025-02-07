"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusIcon, MinusIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { Clause, PreambulatoryPhrases, OperativePhrases, SubClause, SubSubClause } from "@/types/socket-events";
import { cn } from "@/lib/utils";
import { romanize } from "@/lib/romanize";

interface ClauseEditorProps {
	clauses: Clause[];
	onUpdate: (clause: Clause, updateType: "edit" | "reorder" | "delete") => void;
	onDelete: (clauseId: string) => void;
	phrases: PreambulatoryPhrases[] | OperativePhrases[];
	type: "preambulatory" | "operative";
	hideSubClauses?: boolean;
	hideSubSubClauses?: boolean;
	className?: string;
}

interface TextareaProps {
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	className?: string;
}

const NonDebouncedTextarea: React.FC<TextareaProps> = ({ value, onChange, placeholder, className = "" }) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const adjustHeight = () => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto";
			textarea.style.height = `${textarea.scrollHeight}px`;
		}
	};

	useEffect(() => {
		adjustHeight();
		window.addEventListener("resize", adjustHeight);
		return () => window.removeEventListener("resize", adjustHeight);
	}, [value, adjustHeight]); // Added adjustHeight to dependencies

	return (
		<Textarea
			ref={textareaRef}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className={cn(
				"!focus-visible:ring-0 dark:bg-gray-800/90 focus:bg-zinc-200/80 dark:focus:bg-zinc-800/80 !focus:outline-[0px] !focus:ring-[0px] min-h-[20px] !right-0 !border-none !outline-none !focus-visible:outline-none shadow-none w-full resize-none overflow-hidden focus:outline-none focus:ring-0 p-0 text-sm ml-1 transition-[height] duration-100 ease-in-out",
				className
			)}
			placeholder={placeholder}
			rows={1}
		/>
	);
};

const ButtonWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return <div className="flex flex-row bg-white max-w-max dark:bg-black ml-auto gap-1 px-1 rounded-md shadow-sm max-h-5">{children}</div>;
};

const SubClauseComponent: React.FC<{
	subClause: SubClause;
	subIndex: number;
	updateSubClause: (index: number, content: string) => void;
	deleteSubClause: (index: number) => void;
	addSubSubClause: (subClauseIndex: number) => void;
	moveSubClause: (index: number, direction: "up" | "down") => void;
	updateSubSubClause: (subClauseIndex: number, subSubClauseIndex: number, content: string) => void;
	deleteSubSubClause: (subClauseIndex: number, subSubClauseIndex: number) => void;
	moveSubSubClause: (subClauseIndex: number, subSubClauseIndex: number, direction: "up" | "down") => void;
	isFirst: boolean;
	isLast: boolean;
	hideSubSubClause?: boolean;
}> = ({ subClause, subIndex, updateSubClause, deleteSubClause, addSubSubClause, moveSubClause, updateSubSubClause, deleteSubSubClause, moveSubSubClause, isFirst, isLast, hideSubSubClause = false }) => {
	if (hideSubSubClause) return null;
	return (
		<div className="ml-8 mt-2 ring-1 ring-sidebar-border p-2 rounded-md">
			<div className="flex align-top">
				<div className="font-bold -mt-1 !h-full align-top flex flex-col min-w-[1.5rem]">{`${String.fromCharCode(97 + subIndex)})`}</div>
				<NonDebouncedTextarea className="mr-2" value={subClause.content} onChange={(value) => updateSubClause(subIndex, value)} placeholder="Enter sub-clause" />
				<ButtonWrapper>
					<Button className="p-1 aspect-square w-full md:w-5" variant="ghost" size="xs" onClick={() => deleteSubClause(subIndex)}>
						<MinusIcon className="h-3 w-3" />
					</Button>
					{!hideSubSubClause && (
						<Button className="p-1 aspect-square w-full md:w-5" variant="ghost" size="xs" onClick={() => addSubSubClause(subIndex)}>
							<PlusIcon className="h-3 w-3" />
						</Button>
					)}
					<Button className="p-1 aspect-square w-full md:w-5" variant="ghost" size="xs" onClick={() => moveSubClause(subIndex, "up")} disabled={isFirst}>
						<ChevronUpIcon className="h-3 w-3" />
					</Button>
					<Button className="p-1 aspect-square w-full md:w-5" variant="ghost" size="xs" onClick={() => moveSubClause(subIndex, "down")} disabled={isLast}>
						<ChevronDownIcon className="h-3 w-3" />
					</Button>
				</ButtonWrapper>
			</div>

			{subClause.subSubClauses.map((subSubClause, subSubIndex) => (
				<SubSubClauseComponent
					key={subSubIndex}
					subSubClause={subSubClause}
					subClauseIndex={subIndex}
					subSubClauseIndex={subSubIndex}
					updateSubSubClause={(content) => updateSubSubClause(subIndex, subSubIndex, content)}
					deleteSubSubClause={() => deleteSubSubClause(subIndex, subSubIndex)}
					moveSubSubClause={(direction) => moveSubSubClause(subIndex, subSubIndex, direction)}
					isFirst={subSubIndex === 0}
					isLast={subSubIndex === subClause.subSubClauses.length - 1}
				/>
			))}
		</div>
	);
};

const SubSubClauseComponent: React.FC<{
	subSubClause: SubSubClause;
	subClauseIndex: number;
	subSubClauseIndex: number;
	updateSubSubClause: (content: string) => void;
	deleteSubSubClause: () => void;
	moveSubSubClause: (direction: "up" | "down") => void;
	isFirst: boolean;
	isLast: boolean;
}> = ({ subSubClause, updateSubSubClause, deleteSubSubClause, moveSubSubClause, isFirst, isLast, subSubClauseIndex }) => {
	return (
		<div className="ml-6 mt-2 flex align-top ring-1 p-2 rounded-md ring-sidebar-border">
			<span className="font-bold min-w-[1.5rem] text-right">{`${romanize(subSubClauseIndex + 1).toLowerCase()}.`}</span>
			<NonDebouncedTextarea value={subSubClause.content} onChange={updateSubSubClause} placeholder="Enter sub-sub-clause" className="mr-2" />
			<ButtonWrapper>
				<Button className="p-1 aspect-square w-full md:w-5" variant="ghost" size="xs" onClick={deleteSubSubClause}>
					<MinusIcon className="h-3 w-3" />
				</Button>
				<Button className="p-1 aspect-square w-full md:w-5" variant="ghost" size="xs" onClick={() => moveSubSubClause("up")} disabled={isFirst}>
					<ChevronUpIcon className="h-3 w-3" />
				</Button>
				<Button className="p-1 aspect-square w-full md:w-5" variant="ghost" size="xs" onClick={() => moveSubSubClause("down")} disabled={isLast}>
					<ChevronDownIcon className="h-3 w-3" />
				</Button>
			</ButtonWrapper>
		</div>
	);
};

const ClauseComponent: React.FC<{
	clause: Clause;
	updateClause: (updatedClause: Clause, updateType: "edit" | "reorder") => void;
	deleteClause: (clauseId: string) => void;
	moveClause: (clauseId: string, direction: "up" | "down") => void;
	type: "preambulatory" | "operative";
	phrases: PreambulatoryPhrases[] | OperativePhrases[];
	isFirst: boolean;
	isLast: boolean;
	index: number;
	hideSubClauses?: boolean;
	hideSubSubClauses?: boolean;
	className?: string;
}> = ({ clause, updateClause, deleteClause, moveClause, type, phrases, isFirst, isLast, index, hideSubClauses = false, hideSubSubClauses = false, className = "" }) => {
	const updateClauseField = (field: keyof Clause, value: any) => {
		const updatedClause = { ...clause, [field]: value };
		updateClause(updatedClause, "edit");
	};

	const addSubClause = () => {
		const newSubClause: SubClause = { content: "", subSubClauses: [] };
		const updatedClause = {
			...clause,
			subClauses: Array.isArray(clause.subClauses) ? [...clause.subClauses, newSubClause] : [newSubClause],
		};
		updateClause(updatedClause, "edit");
	};

	const updateSubClause = (index: number, content: string) => {
		const updatedSubClauses = Array.isArray(clause.subClauses) ? [...clause.subClauses] : [];
		updatedSubClauses[index] = { ...updatedSubClauses[index], content };
		const updatedClause = { ...clause, subClauses: updatedSubClauses };
		updateClause(updatedClause, "edit");
	};

	const deleteSubClause = (index: number) => {
		const updatedSubClauses = Array.isArray(clause.subClauses) ? clause.subClauses.filter((_, i) => i !== index) : [];
		const updatedClause = { ...clause, subClauses: updatedSubClauses };
		updateClause(updatedClause, "edit");
	};

	const moveSubClause = (index: number, direction: "up" | "down") => {
		const updatedSubClauses = Array.isArray(clause.subClauses) ? [...clause.subClauses] : [];
		if ((direction === "up" && index > 0) || (direction === "down" && index < updatedSubClauses.length - 1)) {
			const newIndex = direction === "up" ? index - 1 : index + 1;
			const [movedSubClause] = updatedSubClauses.splice(index, 1);
			updatedSubClauses.splice(newIndex, 0, movedSubClause);
			const updatedClause = { ...clause, subClauses: updatedSubClauses };
			updateClause(updatedClause, "edit");
		}
	};

	const addSubSubClause = (subClauseIndex: number) => {
		const updatedSubClauses = Array.isArray(clause.subClauses) ? [...clause.subClauses] : [];
		const newSubSubClause: SubSubClause = { content: "" };
		if (updatedSubClauses[subClauseIndex]) {
			updatedSubClauses[subClauseIndex] = {
				...updatedSubClauses[subClauseIndex],
				subSubClauses: Array.isArray(updatedSubClauses[subClauseIndex].subSubClauses) ? [...updatedSubClauses[subClauseIndex].subSubClauses, newSubSubClause] : [newSubSubClause],
			};
		}
		const updatedClause = { ...clause, subClauses: updatedSubClauses };
		updateClause(updatedClause, "edit");
	};

	const updateSubSubClause = (subClauseIndex: number, subSubClauseIndex: number, content: string) => {
		const updatedSubClauses = [...clause.subClauses];
		const updatedSubSubClauses = [...updatedSubClauses[subClauseIndex].subSubClauses];
		updatedSubSubClauses[subSubClauseIndex] = { ...updatedSubSubClauses[subSubClauseIndex], content };
		updatedSubClauses[subClauseIndex] = {
			...updatedSubClauses[subClauseIndex],
			subSubClauses: updatedSubSubClauses,
		};
		const updatedClause = { ...clause, subClauses: updatedSubClauses };
		updateClause(updatedClause, "edit");
	};

	const deleteSubSubClause = (subClauseIndex: number, subSubClauseIndex: number) => {
		const updatedSubClauses = [...clause.subClauses];
		const updatedSubSubClauses = updatedSubClauses[subClauseIndex].subSubClauses.filter((_, i) => i !== subSubClauseIndex);
		updatedSubClauses[subClauseIndex] = {
			...updatedSubClauses[subClauseIndex],
			subSubClauses: updatedSubSubClauses,
		};
		const updatedClause = { ...clause, subClauses: updatedSubClauses };
		updateClause(updatedClause, "edit");
	};

	const moveSubSubClause = (subClauseIndex: number, subSubClauseIndex: number, direction: "up" | "down") => {
		const updatedSubClauses = [...clause.subClauses];
		const updatedSubSubClauses = [...updatedSubClauses[subClauseIndex].subSubClauses];
		if ((direction === "up" && subSubClauseIndex > 0) || (direction === "down" && subSubClauseIndex < updatedSubSubClauses.length - 1)) {
			const newIndex = direction === "up" ? subSubClauseIndex - 1 : subSubClauseIndex + 1;
			const [movedSubSubClause] = updatedSubSubClauses.splice(subSubClauseIndex, 1);
			updatedSubSubClauses.splice(newIndex, 0, movedSubSubClause);
			updatedSubClauses[subClauseIndex] = {
				...updatedSubClauses[subClauseIndex],
				subSubClauses: updatedSubSubClauses,
			};
			const updatedClause = { ...clause, subClauses: updatedSubClauses };
			updateClause(updatedClause, "edit");
		}
	};

	if (hideSubClauses) {
		hideSubSubClauses = true;
	}

	return (
		<motion.div layout initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.3 }} className="mb-6">
			<div className={`p-4 bg-sidebar-primary-foreground dark:bg-black shadow-sm rounded-md ${type === "preambulatory" ? "" : "border-green-300"} ${type === "preambulatory" ? "italic" : ""} ${className}`}>
				<div className="flex flex-row sm:space-y-0 mb-2">
					<div className="font-extralight min-w-[1.5rem] mt-[8px]">{`${index + 1}.`}</div>
					<div className="flex-col flex w-full gap-2">
						<div className="md:flex-row flex-col flex gap-2">
							<Select value={clause.startingPhrase} onValueChange={(value) => updateClauseField("startingPhrase", value as PreambulatoryPhrases | OperativePhrases)}>
								<SelectTrigger className="bg-white dark:bg-black min-w-[180px] h-10 w-auto text-sm border-none focus:ring-0">
									<SelectValue placeholder="Select phrase" />
								</SelectTrigger>
								<SelectContent>
									{phrases.map((phrase) => (
										<SelectItem key={phrase} value={phrase}>
											{phrase}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<ButtonWrapper>
								<Button className="p-1 aspect-square w-full md:w-5" variant="ghost" size="xs" onClick={() => deleteClause(clause.id!)}>
									<MinusIcon className="h-3 w-3" />
								</Button>
								{!hideSubClauses && (
									<Button className="p-1 aspect-square md:w-5 w-full" variant="ghost" size="xs" onClick={addSubClause}>
										<PlusIcon className="h-3 w-3" />
									</Button>
								)}
								<Button className="p-1 aspect-square md:w-5 w-full" variant="ghost" size="xs" onClick={() => moveClause(clause.id!, "up")} disabled={isFirst}>
									<ChevronUpIcon className="h-3 w-3" />
								</Button>
								<Button className="p-1 aspect-square md:w-5 w-full" variant="ghost" size="xs" onClick={() => moveClause(clause.id!, "down")} disabled={isLast}>
									<ChevronDownIcon className="h-3 w-3" />
								</Button>
							</ButtonWrapper>
						</div>
						<NonDebouncedTextarea className="p-2 bg-zinc-100 m-0" value={clause.body} onChange={(value) => updateClauseField("body", value)} placeholder="Enter clause body" />
					</div>
				</div>
				{!hideSubClauses &&
					Array.isArray(clause.subClauses) &&
					clause.subClauses.map((subClause, subIndex) => (
						<SubClauseComponent
							key={subIndex}
							subClause={subClause}
							subIndex={subIndex}
							updateSubClause={updateSubClause}
							deleteSubClause={deleteSubClause}
							addSubSubClause={addSubSubClause}
							moveSubClause={moveSubClause}
							updateSubSubClause={updateSubSubClause}
							deleteSubSubClause={deleteSubSubClause}
							moveSubSubClause={moveSubSubClause}
							isFirst={subIndex === 0}
							isLast={subIndex === clause.subClauses.length - 1}
							hideSubSubClause={hideSubSubClauses}
						/>
					))}
			</div>
		</motion.div>
	);
};

export function ClauseEditor({ clauses, onUpdate, onDelete, phrases, type, hideSubClauses = false, hideSubSubClauses = false, className = "" }: ClauseEditorProps) {
	const moveClause = (clauseId: string, direction: "up" | "down") => {
		const updatedClauses = [...clauses];
		const clauseIndex = updatedClauses.findIndex((c) => c.id === clauseId);
		if (clauseIndex === -1) return;

		const newIndex = direction === "up" ? clauseIndex - 1 : clauseIndex + 1;
		if (newIndex < 0 || newIndex >= updatedClauses.length) return; // Swap the clauses
		[updatedClauses[clauseIndex], updatedClauses[newIndex]] = [updatedClauses[newIndex], updatedClauses[clauseIndex]];

		// Update indices
		updatedClauses.forEach((clause, index) => {
			clause.index = index + 1;
		});

		// Update all clauses
		updatedClauses.forEach((clause) => {
			onUpdate(clause, "reorder");
		});
	};

	return (
		<div className="font-serif font-[Times New Roman] text-base">
			{clauses.map((clause, index) => (
				<ClauseComponent
					hideSubClauses={hideSubClauses}
					hideSubSubClauses={hideSubSubClauses}
					key={clause.id || `temp-${index}`}
					clause={clause}
					index={index}
					updateClause={(updatedClause, updateType) => onUpdate(updatedClause, updateType)}
					deleteClause={onDelete}
					moveClause={moveClause}
					type={type}
					phrases={phrases}
					isFirst={index === 0}
					isLast={index === clauses.length - 1}
					className={className}
				/>
			))}
		</div>
	);
}
