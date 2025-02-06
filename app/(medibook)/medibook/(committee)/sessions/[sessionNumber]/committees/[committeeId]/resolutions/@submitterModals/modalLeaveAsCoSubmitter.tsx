"use client";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Description, Field, Label } from "@/components/fieldset";
import { useFlushState } from "@/hooks/use-flush-state";
import { removeSearchParams, updateSearchParams } from "@/lib/search-params";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Prisma } from "@prisma/client";
import { Select } from "@/components/select";
import { createMediWriteResolution, inviteCoSubmitter, leaveAsCosubmitter } from "./action";
import { Input } from "@/components/input";
import { toast } from "sonner";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import { countries } from "@/data/countries";
import { Avatar } from "@heroui/avatar";

type ApplicableDelegateType = Prisma.DelegateGetPayload<{
	include: {
		user: true;
	};
}>;

type ResolutionType = Prisma.ResolutionGetPayload<{
	include: {
		topic: true;
		mainSubmitter: {
			include: {
				user: true;
			};
		};
		committee: {
			include: {
				Topic: true;
			};
		};
		CoSubmitters: {
			include: {
				delegate: {
					include: {
						user: true;
					};
				};
			};
		};
	};
}>;

export function ModalLeaveAsCoSubmitter({ selectedResolution }: { selectedResolution: ResolutionType }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const params = useParams();

	const [isLoading, setIsLoading] = useFlushState(false);

	async function handleSubmit() {
		const res = await leaveAsCosubmitter(selectedResolution.id);
		if (res?.ok) {
			toast.success(res?.message);
			router.push(
				`/medibook/sessions/${params?.sessionNumber}/committees/${selectedResolution.committee.slug || selectedResolution.committeeId}/resolutions`
			);
		} else {
			toast.error(res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	function onClose() {
		removeSearchParams({ "leave-co-submitter": "" }, router);
	}

	const isOpen = searchParams && selectedResolution && searchParams.has("leave-co-submitter");

	return (
		<Dialog open={isOpen} onClose={onClose}>
			<DialogTitle>Leave as Co-Submitter</DialogTitle>
			<DialogDescription>
				Are you sure you want to leave as a co-submitter for {selectedResolution.title}? You will no longer be able to edit this resolution.
			</DialogDescription>
			<DialogActions>
				<Button disabled={isLoading} plain onClick={onClose}>
					Cancel
				</Button>
				<Button color={"red"} disabled={isLoading} onClick={handleSubmit}>
					Leave
				</Button>
			</DialogActions>
		</Dialog>
	);
}
