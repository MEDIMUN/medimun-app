"use client";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogTitle } from "@/components/dialog";
import { useFlushState } from "@/hooks/use-flush-state";
import { removeSearchParams } from "@/lib/search-params";
import { useRouter, useSearchParams } from "next/navigation";
import { PreambulatoryClauseStatus, Prisma } from "@prisma/client";
import { toast } from "sonner";
/* import { createAlliance } from "./action";
 */ import { Select } from "@/components/select";
import { countries } from "@/data/countries";
import { Field, Label } from "@/components/fieldset";
import { Clause, PreambulatoryPhrases } from "@/types/socket-events";
import { useCallback, useState } from "react";
import { ClauseEditor } from "@/components/not-debounced-clause-editor";
import { createScClause } from "./actions";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";

type ApplicableDelegateType = Prisma.DelegateGetPayload<{
	include: {
		user: true;
	};
}>;

type AllianceType = Prisma.AllianceGetPayload<{
	select: {
		id: true;
		number: true;
	};
}>;

export function ModalCreatePreambulatoryClause({
	selectedAlliance,
	allCountriesInAlliance,
	allMembersInAlliance,
}: {
	selectedAlliance: Prisma.AllianceGetPayload<{ select: { id: true } }>;
	allCountriesInAlliance: typeof countries;
	allMembersInAlliance: ApplicableDelegateType[];
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [clause, setClause] = useState({
		index: 0,
		startingPhrase: Object.values(PreambulatoryClauseStatus)[0],
		body: "",
		subClauses: [],
		allianceId: selectedAlliance.id,
	});
	const [selectedCountry, setSelectedCountry] = useState(null);

	const [isLoading, setIsLoading] = useFlushState(false);

	function onClose() {
		removeSearchParams({ "create-preambulatory-clause": null });
	}

	const isOpen = searchParams && selectedAlliance && searchParams.has("create-preambulatory-clause");

	const handleUpdate = (updatedClause: Clause, updateType: "edit" | "reorder" | "delete") => {
		if (updateType === "edit") {
			setClause(updatedClause);
		}
	};

	async function handleSubmit() {
		if (isLoading) return;
		setIsLoading(true);
		const res = await createScClause({
			clause,
			allianceId: selectedAlliance.id,
			type: "PREAMBULATORY",
			mainSubmitterId: selectedCountry,
		});
		console.log(res);
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
			onClose();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	const handleDelete = useCallback(() => {}, []);

	return (
		<Dialog size="5xl" open={isOpen} onClose={() => {}}>
			<DialogTitle>Create Preambulatory Clause</DialogTitle>
			<DialogBody>
				<Field>
					<Label>Main Submitter</Label>
					<Listbox name="delegateId" onChange={(e) => setSelectedCountry(e)} value={selectedCountry}>
						{allMembersInAlliance.map((member) => {
							const country = allCountriesInAlliance.find((c) => c.countryCode === member.country)?.countryNameEn;
							const fullName = member.user.displayName || `${member.user.officialName} ${member.user.officialSurname}`;
							console.log(member);
							return (
								<ListboxOption key={member.id} value={member.id}>
									<ListboxLabel>{country}</ListboxLabel>
									<ListboxDescription>{fullName}</ListboxDescription>
								</ListboxOption>
							);
						})}
					</Listbox>
				</Field>
				<ClauseEditor className="shadow-md! border mt-4" onUpdate={handleUpdate} onDelete={handleDelete} clauses={[clause]} phrases={Object.values(PreambulatoryPhrases)} type={"preambulatory"} hideSubClauses />{" "}
				<DialogActions>
					<Button plain onClick={onClose}>
						Cancel
					</Button>
					<Button color="red" disabled={isLoading} onClick={handleSubmit} type="button">
						Create
					</Button>
				</DialogActions>
			</DialogBody>
		</Dialog>
	);
}

export function ModalCreateOperativeClause({
	selectedAlliance,
	allCountriesInAlliance,
	allMembersInAlliance,
}: {
	selectedAlliance: Prisma.AllianceGetPayload<{ select: { id: true } }>;
	allCountriesInAlliance: typeof countries;
	allMembersInAlliance: ApplicableDelegateType[];
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [clause, setClause] = useState({
		index: 0,
		startingPhrase: Object.values(PreambulatoryClauseStatus)[0],
		body: "",
		subClauses: [],
		allianceId: selectedAlliance.id,
	});
	const [selectedCountry, setSelectedCountry] = useState(null);

	const [isLoading, setIsLoading] = useFlushState(false);

	function onClose() {
		removeSearchParams({ "create-operative-clause": null });
	}

	const isOpen = searchParams && selectedAlliance && searchParams.has("create-operative-clause");

	const handleUpdate = (updatedClause: Clause, updateType: "edit" | "reorder" | "delete") => {
		if (updateType === "edit") {
			setClause(updatedClause);
		}
	};

	async function handleSubmit() {
		if (isLoading) return;
		setIsLoading(true);
		const res = await createScClause({
			clause,
			allianceId: selectedAlliance.id,
			type: "OPERATIVE",
			mainSubmitterId: selectedCountry,
		});
		console.log(res);
		if (res?.ok) {
			toast.success(res?.message);
			onClose();
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	const handleDelete = useCallback(() => {}, []);

	return (
		<Dialog size="5xl" open={isOpen} onClose={() => {}}>
			<DialogTitle>Create Operative Clause</DialogTitle>
			<DialogBody>
				<Field>
					<Label>Main Submitter</Label>
					<Listbox name="delegateId" onChange={(e) => setSelectedCountry(e)} value={selectedCountry}>
						{allMembersInAlliance.map((member) => {
							const country = allCountriesInAlliance.find((c) => c.countryCode === member.country)?.countryNameEn;
							const fullName = member.user.displayName || `${member.user.officialName} ${member.user.officialSurname}`;
							console.log(member);
							return (
								<ListboxOption key={member.id} value={member.id}>
									<ListboxLabel>{country}</ListboxLabel>
									<ListboxDescription>{fullName}</ListboxDescription>
								</ListboxOption>
							);
						})}
					</Listbox>
				</Field>
				<ClauseEditor className="shadow-md! border mt-4" onUpdate={handleUpdate} onDelete={handleDelete} clauses={[clause]} phrases={Object.values(PreambulatoryPhrases)} type={"operative"} />
				<DialogActions>
					<Button plain onClick={onClose}>
						Cancel
					</Button>
					<Button color="red" disabled={isLoading} onClick={handleSubmit} type="button">
						Create
					</Button>
				</DialogActions>
			</DialogBody>
		</Dialog>
	);
}

export function ModalEditClause({ selectedClause }: { selectedClause: Clause }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [clause, setClause] = useState(selectedClause);
	const [isLoading, setIsLoading] = useFlushState(false);

	function onClose() {
		removeSearchParams({ "edit-clause": null });
	}

	const isOpen = searchParams && selectedClause && searchParams.has("edit-clause");

	const handleUpdate = (updatedClause: Clause, updateType: "edit" | "reorder" | "delete") => {
		if (updateType === "edit") {
			setClause(updatedClause);
		}
	};

	async function handleSubmit() {
		if (isLoading) return;
		setIsLoading(true);
		const res = await createScClause({
			clause,
			allianceId: selectedClause.allianceId,
			type: selectedClause.type,
			mainSubmitterId: selectedClause.mainSubmitterId,
		});
		console.log(res);
		if (res?.ok) {
			toast.success(res?.message);
			onClose();
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	const handleDelete = useCallback(() => {}, []);

	return (
		<Dialog size="5xl" open={isOpen} onClose={() => {}}>
			<DialogTitle>Edit Clause</DialogTitle>
			<DialogBody>
				<ClauseEditor className="shadow-md! border mt-4" onUpdate={handleUpdate} onDelete={handleDelete} clauses={[clause]} phrases={Object.values(PreambulatoryPhrases)} type={clause.type} />
				<DialogActions>
					<Button plain onClick={onClose}>
						Cancel
					</Button>
					<Button color="red" disabled={isLoading} onClick={handleSubmit} type="button">
						Update
					</Button>
				</DialogActions>
			</DialogBody>
		</Dialog>
	);
}
