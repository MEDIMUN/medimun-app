"use client";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/description-list";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Dropdown, DropdownButton, DropdownDescription, DropdownItem, DropdownLabel, DropdownMenu } from "@/components/dropdown";
import { authorize, s } from "@/lib/authorize";
import { romanize } from "@/lib/romanize";
import { removeSearchParams } from "@/lib/search-params";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useState } from "react";
import { approveSchoolDelegateAssignmentProposal, approveSchoolDirectorApplication, deleteSchoolDirectorApplication } from "./actions";
import { toast } from "sonner";
import { Link } from "@/components/link";

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

export function ApproveSchoolDelegateAssignmentProposalModal({ selectedAssignmentProposal, selectedUsers }) {
	const { data: authSession, status } = useSession();
	const [isLoading, setIsLoading] = useState(false);
	const searchParams = useSearchParams();
	const router = useRouter();

	if (!searchParams) return null;
	if (!selectedAssignmentProposal) return null;

	function onClose() {
		removeSearchParams({ "approve-school-delegate-assignment-proposal": "" }, router);
	}

	async function aproveDelegateAssignmentProposal() {
		if (isLoading) return;
		setIsLoading(true);
		const res = await approveSchoolDelegateAssignmentProposal(selectedAssignmentProposal.id);
		if (res?.ok) {
			toast.success(...res?.message);
			router.refresh();
			onClose();
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	const isopen =
		!!searchParams.get("approve-school-delegate-assignment-proposal") &&
		!!selectedAssignmentProposal &&
		status === "authenticated" &&
		authorize(authSession, [s.management]);

	const selectedAssignment = selectedAssignmentProposal.changes.length ? selectedAssignmentProposal.changes : selectedAssignmentProposal.assignment;

	return (
		<Dialog open={isopen} onClose={onClose}>
			<DialogTitle>
				Confirm <i>{selectedAssignmentProposal.school.name}</i> Delegate Assignment
			</DialogTitle>
			<DialogDescription>
				All delegates will be assigned to their respective committees and countries. The school will be given an invoice.
			</DialogDescription>
			<DialogBody>
				<DescriptionList>
					<DescriptionTerm>School</DescriptionTerm>
					<DescriptionDetails>{selectedAssignmentProposal.school.name}</DescriptionDetails>
					<DescriptionTerm>Application ID</DescriptionTerm>
					<DescriptionDetails>{selectedAssignmentProposal.id}</DescriptionDetails>
					<DescriptionTerm>School Director{selectedAssignmentProposal.school.director.length > 1 && "s"}</DescriptionTerm>
					<DescriptionDetails>
						{selectedAssignmentProposal.school.director.map((director, index) => {
							return (
								<Fragment key={`confirm-modal-${director.id}-${index}`}>
									<Link className="text-primary hover:underline" href={`/medibook/users/${director.user.username || director.user.id}`}>
										{director.user.displayName || `${director.user.officialName} ${director.user.officialSurname}`}
									</Link>
									<span>{index < selectedAssignmentProposal.school.director.length - 1 ? ", " : ""}</span>
								</Fragment>
							);
						})}
					</DescriptionDetails>
					<DescriptionTerm>Modifications</DescriptionTerm>
					<DescriptionDetails>
						{selectedAssignmentProposal.changes.length ? (
							<Badge color="yellow">{selectedAssignmentProposal.assignment.length - selectedAssignmentProposal.changes.length} Delegate</Badge>
						) : (
							<Badge>None</Badge>
						)}
					</DescriptionDetails>
					<DescriptionTerm>Number of Delegates</DescriptionTerm>
					<DescriptionDetails>{selectedAssignment.length}</DescriptionDetails>
					<DescriptionTerm>Delegates</DescriptionTerm>
					<DescriptionDetails>
						{selectedAssignment.map((delegate, index) => {
							const selectedStudent = selectedUsers.find((user) => user.id === delegate.studentId);
							const fullName = selectedStudent?.displayName || `${selectedStudent?.officialName} ${selectedStudent?.officialSurname}`;
							return (
								<Fragment key={`confirm-delegates-${selectedStudent.id}-${index}`}>
									<Link className="text-primary hover:underline" href={`/medibook/users/${delegate.studentId}`}>
										{fullName}
									</Link>
									<span>{index < selectedAssignment.length - 1 ? ", " : ""}</span>
								</Fragment>
							);
						})}
					</DescriptionDetails>
				</DescriptionList>
			</DialogBody>
			<DialogActions>
				<Button disabled={isLoading} onClick={onClose} plain>
					Cancel
				</Button>
				<Button disabled={isLoading} onClick={aproveDelegateAssignmentProposal} color="green">
					Approve
				</Button>
			</DialogActions>
		</Dialog>
	);
}
