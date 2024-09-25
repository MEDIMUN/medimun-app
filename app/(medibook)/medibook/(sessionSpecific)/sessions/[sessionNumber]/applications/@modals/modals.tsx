"use client";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/description-list";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Dropdown, DropdownButton, DropdownDescription, DropdownItem, DropdownLabel, DropdownMenu } from "@/components/dropdown";
import { authorize, s } from "@/lib/authorize";
import { romanize } from "@/lib/romanize";
import { removeSearchParams } from "@/lib/searchParams";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { approveSchoolDirectorApplication, deleteSchoolDirectorApplication } from "./actions";
import { toast } from "sonner";

export function ApproveApplicationModal({ selectedApplication }) {
	const { data: authSession, status } = useSession();
	const [isLoading, setIsLoading] = useState(false);
	const searchParams = useSearchParams();
	const router = useRouter();

	if (!selectedApplication) return null;

	function onClose() {
		removeSearchParams({ "approve-school-director-application": "" }, router);
	}

	const { user } = selectedApplication;
	const { school } = selectedApplication;

	async function approveApplicationHandler() {
		if (isLoading) return;
		setIsLoading(true);
		const res = await approveSchoolDirectorApplication(selectedApplication.id);
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
			onClose();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	const isopen =
		!!searchParams.get("approve-school-director-application") &&
		!!selectedApplication &&
		status === "authenticated" &&
		authorize(authSession, [s.sd]);

	return (
		<Dialog open={isopen} onClose={onClose}>
			<DialogTitle>Approve School Director</DialogTitle>
			<DialogDescription>Are you sure you want to approve the application of {user?.officialName}?</DialogDescription>
			<DialogBody>
				<DescriptionList>
					<DescriptionTerm>Application ID</DescriptionTerm>
					<DescriptionDetails>{selectedApplication.id}</DescriptionDetails>

					<DescriptionTerm>Application Date</DescriptionTerm>
					<DescriptionDetails>{selectedApplication.date.toLocaleString("en-GB").replace(",", " at ")}</DescriptionDetails>

					<DescriptionTerm>School Name</DescriptionTerm>
					<DescriptionDetails>{school.name}</DescriptionDetails>

					<DescriptionTerm>School Email</DescriptionTerm>
					<DescriptionDetails>{school.email || "-"}</DescriptionDetails>

					<DescriptionTerm>Applicant Name</DescriptionTerm>
					<DescriptionDetails>{`${user.officialName} ${user.officialSurname}`}</DescriptionDetails>

					<DescriptionTerm>Applicant Phone Number</DescriptionTerm>
					<DescriptionDetails>{user.phoneNumber || "-"}</DescriptionDetails>

					<DescriptionTerm>Applicant Email</DescriptionTerm>
					<DescriptionDetails>{user.email}</DescriptionDetails>

					<DescriptionTerm>
						<div className="flex h-full">
							<span className="my-auto">Previous School Director Roles</span>
						</div>
					</DescriptionTerm>
					<DescriptionDetails>
						{selectedApplication.user.schoolDirector.length == 0 ? "None" : selectedApplication.user.schoolDirector.length} Role
						{selectedApplication.user.schoolDirector.length == 1 ? "" : "s"}
						{!!selectedApplication.user.schoolDirector.length && (
							<Dropdown>
								<DropdownButton className="ml-2" plain>
									View
								</DropdownButton>
								<DropdownMenu>
									{selectedApplication.user.schoolDirector.map((sd) => {
										return (
											<DropdownItem key={sd.id} href={`/medibook/sessions/${sd.session.number}`}>
												<DropdownLabel>{sd.school.name}</DropdownLabel>
												<DropdownDescription>
													Session {romanize(sd.session.numberInteger)} ({sd.session.number})
												</DropdownDescription>
											</DropdownItem>
										);
									})}
								</DropdownMenu>
							</Dropdown>
						)}
					</DescriptionDetails>
					<DescriptionTerm>Application Status</DescriptionTerm>
					<DescriptionDetails>
						{selectedApplication.status ? <Badge color="green">Approved</Badge> : <Badge color="yellow">Pending</Badge>}
					</DescriptionDetails>
				</DescriptionList>
			</DialogBody>
			<DialogActions>
				<Button disabled={isLoading} onClick={onClose} plain>
					Cancel
				</Button>
				<Button disabled={isLoading || selectedApplication.isApproved} onClick={approveApplicationHandler} color="green">
					Approve
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export function DeleteApplicationModal({ selectedApplication }) {
	const { data: authSession, status } = useSession();
	const [isLoading, setIsLoading] = useState(false);
	const searchParams = useSearchParams();
	const router = useRouter();

	if (!selectedApplication) return null;

	function onClose() {
		removeSearchParams({ "delete-school-director-application": "" }, router);
	}

	const { user } = selectedApplication;
	const { school } = selectedApplication;

	async function approveApplicationHandler() {
		if (isLoading) return;
		setIsLoading(true);
		const res = await deleteSchoolDirectorApplication(selectedApplication.id);
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
			onClose();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	const isopen =
		!!searchParams.get("delete-school-director-application") && !!selectedApplication && status === "authenticated" && authorize(authSession, [s.sd]);

	return (
		<Dialog open={isopen} onClose={onClose}>
			<DialogTitle>Delete School Director Application</DialogTitle>
			<DialogDescription>
				Are you sure you want to delete the application of {user?.officialName}? If you delete the application the person can apply again, leave the
				application as pending if you want the user to not be able to apply as School Director <u>during this session</u> again.
			</DialogDescription>
			<DialogBody>
				<DescriptionList>
					<DescriptionTerm>Application ID</DescriptionTerm>
					<DescriptionDetails>{selectedApplication.id}</DescriptionDetails>

					<DescriptionTerm>Application Date</DescriptionTerm>
					<DescriptionDetails>{selectedApplication.date.toLocaleString("en-GB").replace(",", " at ")}</DescriptionDetails>

					<DescriptionTerm>School Name</DescriptionTerm>
					<DescriptionDetails>{school.name}</DescriptionDetails>

					<DescriptionTerm>School Email</DescriptionTerm>
					<DescriptionDetails>{school.email || "-"}</DescriptionDetails>

					<DescriptionTerm>Applicant Name</DescriptionTerm>
					<DescriptionDetails>{`${user.officialName} ${user.officialSurname}`}</DescriptionDetails>

					<DescriptionTerm>Applicant Phone Number</DescriptionTerm>
					<DescriptionDetails>{user.phoneNumber || "-"}</DescriptionDetails>

					<DescriptionTerm>Applicant Email</DescriptionTerm>
					<DescriptionDetails>{user.email}</DescriptionDetails>

					<DescriptionTerm>
						<div className="flex h-full">
							<span className="my-auto">Previous School Director Roles</span>
						</div>
					</DescriptionTerm>
					<DescriptionDetails>
						{selectedApplication.user.schoolDirector.length == 0 ? "None" : selectedApplication.user.schoolDirector.length} Role
						{selectedApplication.user.schoolDirector.length == 1 ? "" : "s"}
						{!!selectedApplication.user.schoolDirector.length && (
							<Dropdown>
								<DropdownButton className="ml-2" plain>
									View
								</DropdownButton>
								<DropdownMenu>
									{selectedApplication.user.schoolDirector.map((sd) => {
										return (
											<DropdownItem key={sd.id} href={`/medibook/sessions/${sd.session.number}`}>
												<DropdownLabel>{sd.school.name}</DropdownLabel>
												<DropdownDescription>
													Session {romanize(sd.session.numberInteger)} ({sd.session.number})
												</DropdownDescription>
											</DropdownItem>
										);
									})}
								</DropdownMenu>
							</Dropdown>
						)}
					</DescriptionDetails>
					<DescriptionTerm>Application Status</DescriptionTerm>
					<DescriptionDetails>
						{selectedApplication.status ? <Badge color="green">Approved</Badge> : <Badge color="yellow">Pending</Badge>}
					</DescriptionDetails>
				</DescriptionList>
			</DialogBody>
			<DialogActions>
				<Button disabled={isLoading} onClick={onClose} plain>
					Cancel
				</Button>
				<Button disabled={isLoading || selectedApplication.isApproved} onClick={approveApplicationHandler} color="red">
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
}
