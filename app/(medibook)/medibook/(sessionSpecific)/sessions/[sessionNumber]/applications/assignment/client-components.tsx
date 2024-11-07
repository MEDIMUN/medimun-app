"use client";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/description-list";
import { Text } from "@/components/text";
import { countries } from "@/data/countries";
import { Avatar } from "@nextui-org/avatar";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import { delegationAssignmentChanges, getStudentsOfSchool, handleFinalAssignDelegates } from "./actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from "@/components/dialog";
import { useSocket } from "@/contexts/socket";
import { useDebouncedState, useDebouncedValue } from "@mantine/hooks";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import { flushSync } from "react-dom";
import { sortProposal } from "./page";

export function FinalAssignDelegates({ users, delegateProposals, selectedSession }) {
	const [rejectedNominations, setRejectedNominations] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [visibleProposal, setVisibleProposal] = useState(null);
	const [selectedDeleteProposal, setSelectedDeleteProposal] = useState(null);
	const [addStudentsToProposal, setAddStudentsToProposal] = useState(null);
	const router = useRouter();
	const searchParams = useSearchParams();

	async function handleSubmit(assignments, schoolId) {
		if (isLoading) return;
		const filteredAssignments = assignments.filter((a) => !rejectedNominations.includes(a.studentId));
		if (filteredAssignments.length === 0) return toast.error("You cannot assign 0 delegates.");
		setIsLoading(true);
		const res = await handleFinalAssignDelegates(filteredAssignments, selectedSession.id, schoolId);
		if (res?.ok) {
			toast.success(...res?.message);
			router.refresh();
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	const socket = useSocket();

	useEffect(() => {
		if (!socket) return;
		socket.emit(`join-room`, "delegate-assignment", selectedSession.id);
		return () => {
			socket.emit(`leave-room`, "delegate-assignment", selectedSession.id);
		};
	}, [socket]);
	return (
		<>
			{!!selectedDeleteProposal && <DeleteProposalModal proposal={selectedDeleteProposal} setSelectedDeleteProposal={setSelectedDeleteProposal} />}
			{!!visibleProposal && (
				<ViewEditDelegateProposal
					isLoading={isLoading}
					setIsLoading={setIsLoading}
					setAddStudentsToProposal={setAddStudentsToProposal}
					users={users}
					visibleProposal={visibleProposal}
					setVisibleProposal={setVisibleProposal}
					selectedSession={selectedSession}
				/>
			)}
			{!!addStudentsToProposal && (
				<AddStudentsToProposalModal
					selectedSession={selectedSession}
					setAddStudentsToProposal={setAddStudentsToProposal}
					proposal={addStudentsToProposal}
					setVisibleProposal={setVisibleProposal}
				/>
			)}
			<Table>
				<TableHead>
					<TableRow>
						<TableHeader>
							<span className="sr-only">Actions</span>
						</TableHeader>
						<TableHeader>School</TableHeader>
						<TableHeader>Granted GA Delegations</TableHeader>
						<TableHeader>GA Delegates Proposed</TableHeader>
						<TableHeader>Non-GA Delegates Proposed</TableHeader>
						<TableHeader>Modifications</TableHeader>
					</TableRow>
				</TableHead>
				<TableBody>
					{delegateProposals.map((proposal, index) => {
						return (
							<TableRow key={proposal.id}>
								<TableCell>
									<Dropdown>
										<DropdownButton plain>
											<EllipsisVerticalIcon />
										</DropdownButton>
										<DropdownMenu>
											<DropdownItem
												onClick={() => {
													setVisibleProposal(proposal);
												}}>
												View & Edit Students
											</DropdownItem>
											<DropdownItem>Confirm</DropdownItem>
											<DropdownDivider />
											<DropdownItem
												onClick={() => {
													setSelectedDeleteProposal(proposal);
												}}>
												Delete
											</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								</TableCell>
								<TableCell>{proposal.school.name}</TableCell>
								<TableCell>{proposal.school.ApplicationGrantedDelegationCountries[0].countries.length}</TableCell>
								<TableCell>{proposal.assignment.filter((a) => a.countryCode).length || "None"}</TableCell>
								<TableCell>{proposal.assignment.filter((a) => !a.countryCode).length || "None"}</TableCell>
								<TableCell>{proposal.changes.length ? <Badge color="yellow">Modified</Badge> : <Badge color="green">Unmodified</Badge>}</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</>
	);
}

function ConfirmModal({ users, visibleProposal, setVisibleProposal, selectedSession, setAddStudentsToProposal, isLoading, setIsLoading }) {
	const selectedProposal = !!visibleProposal?.changes?.length ? visibleProposal?.changes : visibleProposal?.assignment;
	const router = useRouter();

	async function handleModifyRemoveStudent(studentId) {
		if (isLoading) return;
		setIsLoading(true);
		const newProposal = selectedProposal.filter((a) => a.studentId !== studentId);
		const res = await delegationAssignmentChanges(visibleProposal.id, newProposal);
		if (res?.ok) {
			router.refresh();
			toast.success(...res?.message);
			setVisibleProposal((prev) => ({ ...prev, changes: sortProposal(newProposal, selectedSession.committee) }));
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	return (
		<Dialog
			open={!!visibleProposal}
			onClose={() => {
				setVisibleProposal(null);
			}}>
			<DialogTitle>{visibleProposal?.school?.name} Delegate Assignment Proposal</DialogTitle>
			<DialogDescription>
				Any changes you make here are saved as a draft and won&apos;t take effect until the proposal is approved and returned.
			</DialogDescription>
			<DialogBody>
				<Table className="showscrollbar">
					<TableHead>
						<TableRow>
							<TableHeader>
								<span className="sr-only">Actions</span>
							</TableHeader>
							<TableHeader>
								<span className="sr-only">#</span>
							</TableHeader>
							<TableHeader>
								<span className="sr-only">Profile Picture</span>
							</TableHeader>
							<TableHeader>Name</TableHeader>
							<TableHeader>Committee</TableHeader>
							<TableHeader>Country</TableHeader>
						</TableRow>
					</TableHead>
					<TableBody>
						{selectedProposal?.map((student, index) => {
							const selectedStudent = users.find((u) => u?.id === student.studentId);
							const selectedCommittee = selectedSession.committee.find((c) => c.id === student.committeeId);
							const selectedCountry = countries.find((c) => c.countryCode === student.countryCode);
							return (
								<TableRow key={`student-${selectedStudent?.id}`}>
									<TableCell>
										<Dropdown>
											<DropdownButton plain>
												<EllipsisVerticalIcon />
											</DropdownButton>
											<DropdownMenu>
												<DropdownItem disabled={isLoading} href={`/medibook/users/${selectedStudent?.username || selectedStudent?.id}`}>
													View Student
												</DropdownItem>
												<DropdownItem
													href={`/medibook/sessions/${selectedSession.number}/committees/${selectedCommittee.slug || selectedCommittee.id}
													`}
													disabled={isLoading}>
													View Committee
												</DropdownItem>
												<DropdownDivider />
												<DropdownItem
													disabled={isLoading}
													onClick={() => {
														handleModifyRemoveStudent(student.studentId);
													}}>
													Remove Student
												</DropdownItem>
											</DropdownMenu>
										</Dropdown>
									</TableCell>
									<TableCell>{index + 1}</TableCell>
									<TableCell>
										{selectedStudent?.profilePicture ? (
											<Avatar showFallback size="sm" radius="sm" src={`/api/users/${selectedStudent.id}/avatar`} />
										) : (
											<Avatar showFallback size="sm" radius="sm" />
										)}
									</TableCell>
									<TableCell>{selectedStudent?.displayName || `${selectedStudent?.officialName} ${selectedStudent?.officialSurname}`}</TableCell>
									<TableCell>{selectedCommittee?.name}</TableCell>
									<TableCell>
										{selectedCountry?.flag} {selectedCountry?.countryNameEn || "N/A"}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</DialogBody>
			<DialogActions>
				<Button
					disabled={visibleProposal?.changes?.length === 0}
					onClick={() => {
						handleRevertToOriginal();
					}}
					plain>
					Revert to Original
				</Button>
				<Button
					onClick={() => {
						setAddStudentsToProposal(visibleProposal);
					}}
					plain>
					Add Student
				</Button>
				<Button plain onClick={() => setVisibleProposal(null)}>
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
}

function ViewEditDelegateProposal({
	users,
	visibleProposal,
	setVisibleProposal,
	selectedSession,
	setAddStudentsToProposal,
	isLoading,
	setIsLoading,
}) {
	const selectedProposal = !!visibleProposal?.changes?.length ? visibleProposal?.changes : visibleProposal?.assignment;
	const router = useRouter();
	async function handleModifyRemoveStudent(studentId) {
		if (isLoading) return;
		setIsLoading(true);
		const newProposal = selectedProposal.filter((a) => a.studentId !== studentId);
		const res = await delegationAssignmentChanges(visibleProposal.id, newProposal);
		if (res?.ok) {
			router.refresh();
			toast.success(...res?.message);
			setVisibleProposal((prev) => ({ ...prev, changes: sortProposal(newProposal, selectedSession.committee) }));
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	async function handleRevertToOriginal() {
		if (isLoading) return;
		setIsLoading(true);
		const res = await delegationAssignmentChanges(visibleProposal.id, visibleProposal?.assignment);
		if (res?.ok) {
			toast.success(...res?.message);
			router.refresh();
			flushSync(() => {
				setVisibleProposal((prev) => ({ ...prev, changes: [], assignment: sortProposal(visibleProposal?.assignment, selectedSession.committee) }));
			});
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	return (
		<Dialog
			open={!!visibleProposal}
			onClose={() => {
				setVisibleProposal(null);
			}}>
			<DialogTitle>{visibleProposal?.school?.name} Delegate Assignment Proposal</DialogTitle>
			<DialogDescription>
				Any changes you make here are automatically saved as a draft and won&apos;t take effect until the proposal is approved and returned.
			</DialogDescription>
			<DialogBody>
				<Table className="showscrollbar">
					<TableHead>
						<TableRow>
							<TableHeader>
								<span className="sr-only">Actions</span>
							</TableHeader>
							<TableHeader>
								<span className="sr-only">Profile Picture</span>
							</TableHeader>
							<TableHeader>Name</TableHeader>
							<TableHeader>Committee</TableHeader>
							<TableHeader>Country</TableHeader>
							<TableHeader>Index</TableHeader>
						</TableRow>
					</TableHead>
					<TableBody>
						{selectedProposal?.map((student, index) => {
							const selectedStudent = users.find((u) => u?.id === student.studentId);
							const selectedCommittee = selectedSession.committee.find((c) => c.id === student.committeeId);
							const selectedCountry = countries.find((c) => c.countryCode === student.countryCode);
							return (
								<TableRow key={`student-${selectedStudent?.id}`}>
									<TableCell>
										<Dropdown>
											<DropdownButton plain>
												<EllipsisVerticalIcon />
											</DropdownButton>
											<DropdownMenu>
												<DropdownItem disabled={isLoading} href={`/medibook/users/${selectedStudent?.username || selectedStudent?.id}`}>
													View Student
												</DropdownItem>
												<DropdownItem
													href={`/medibook/sessions/${selectedSession.number}/committees/${selectedCommittee.slug || selectedCommittee.id}
													`}
													disabled={isLoading}>
													View Committee
												</DropdownItem>
												<DropdownDivider />
												<DropdownItem
													disabled={isLoading}
													onClick={() => {
														handleModifyRemoveStudent(student.studentId);
													}}>
													Remove Student
												</DropdownItem>
											</DropdownMenu>
										</Dropdown>
									</TableCell>
									<TableCell>
										{selectedStudent?.profilePicture ? (
											<Avatar showFallback size="sm" radius="sm" src={`/api/users/${selectedStudent.id}/avatar`} />
										) : (
											<Avatar showFallback size="sm" radius="sm" />
										)}
									</TableCell>
									<TableCell>{selectedStudent?.displayName || `${selectedStudent?.officialName} ${selectedStudent?.officialSurname}`}</TableCell>
									<TableCell>{selectedCommittee?.name}</TableCell>
									<TableCell>
										{selectedCountry?.flag} {selectedCountry?.countryNameEn || "N/A"}
									</TableCell>
									<TableCell>{index + 1}</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</DialogBody>
			<DialogActions>
				<Button
					disabled={visibleProposal?.changes?.length === 0}
					onClick={() => {
						handleRevertToOriginal();
					}}
					plain>
					Revert to Original
				</Button>
				<Button
					onClick={() => {
						setAddStudentsToProposal(visibleProposal);
					}}
					plain>
					Add Student
				</Button>
				<Button plain onClick={() => setVisibleProposal(null)}>
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
}

function AddStudentsToProposalModal({ proposal, setAddStudentsToProposal, setVisibleProposal, selectedSession }) {
	const [search, setSearch] = useDebouncedState("", 200);
	const [fetchedUsers, setFetchedUsers] = useState([]);
	const [selectedCommittee, setSelectedCommittee] = useState("");
	const [selectedCountry, setSelectedCountry] = useState("");
	const [selectedUser, setSelectedUser] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	function onClose() {
		setAddStudentsToProposal(null);
	}

	const allCommitees = selectedSession.committee;
	const generalAssemblies = allCommitees.filter((c) => c.type === "GENERALASSEMBLY");
	const specialAndSecurity = allCommitees.filter((c) => c.type !== "GENERALASSEMBLY");

	const selectedAssignment = proposal?.changes?.length ? proposal?.changes : proposal?.assignment;
	const availableGAs = generalAssemblies.filter((c) => {
		const selectedAssignmentHasCommitteeTimes = selectedAssignment.filter((a) => a.committeeId === c.id).length;
		if (selectedAssignmentHasCommitteeTimes >= proposal.school.ApplicationGrantedDelegationCountries[0].countries.length) return false;
		return true;
	});
	const allAvailableCommittees = [...availableGAs, ...specialAndSecurity];
	const usedStudentIDs = selectedAssignment.map((a) => a.studentId);

	async function fetchUsers() {
		setIsLoading(true);
		if (!search) return setFetchedUsers([]);
		const res = await getStudentsOfSchool(proposal.school.id, search, usedStudentIDs);
		if (res.ok) {
			setFetchedUsers(res.data.students);
		}
		setIsLoading(false);
	}

	function getAvailableCountriesOfCommittee(committeeId) {
		const countriesOfSchool = proposal.school.ApplicationGrantedDelegationCountries[0].countries;
		const filteredCountries = countriesOfSchool.filter((c) => {
			const countryAppearsInCommittee = selectedAssignment.filter((a) => a.committeeId === committeeId && a.countryCode === c).length;
			if (countryAppearsInCommittee) return false;
			return true;
		});
		return filteredCountries;
	}

	async function addStudentToAssignment() {
		if (isLoading) return;
		setIsLoading(true);
		const newProposal = [...selectedAssignment, { studentId: selectedUser, committeeId: selectedCommittee.id, countryCode: selectedCountry }];
		const res = await delegationAssignmentChanges(proposal.id, newProposal);
		if (res?.ok) {
			toast.success(...res?.message);
			router.refresh();
			setAddStudentsToProposal(newProposal);
			setVisibleProposal((prev) => ({
				...prev,
				changes: sortProposal(newProposal, selectedSession.committee),
			}));
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
		onClose();
	}

	useEffect(() => {
		setSelectedCommittee("");
		setSelectedCountry("");
		setFetchedUsers([]);
		setSearch("");
	}, [proposal]);

	useEffect(() => {
		fetchUsers();
	}, [search]);

	return (
		<Dialog open={!!proposal} onClose={onClose}>
			<DialogTitle>Add Student to {proposal.school.name} Delegation Proposal</DialogTitle>
			<DialogDescription>Search for students to add to this delegation proposal. You can search by Name, ID, or Email.</DialogDescription>
			<DialogBody className="flex flex-col gap-5">
				<Field>
					<Label>Commitee</Label>
					<Listbox value={selectedCommittee} onChange={(val) => setSelectedCommittee(val)}>
						{allAvailableCommittees.map((c) => (
							<ListboxOption value={c} key={c.id}>
								{c.name}
							</ListboxOption>
						))}
					</Listbox>
				</Field>
				{selectedCommittee && selectedCommittee.type == "GENERALASSEMBLY" && (
					<Field>
						<Label>Country</Label>
						<Listbox
							value={selectedCountry}
							onChange={(e) => {
								setSelectedCountry(e);
							}}>
							{getAvailableCountriesOfCommittee(selectedCommittee.id).map((c) => (
								<ListboxOption value={c} key={c}>
									{countries.find((co) => co.countryCode === c).countryNameEn}
								</ListboxOption>
							))}
						</Listbox>
					</Field>
				)}
				<Field>
					<Label>Search Student</Label>
					<Input
						type="search"
						defaultValue={search}
						onChange={(e) => {
							setSearch(e.target.value);
						}}
					/>
				</Field>
				<Field>
					<Label>Select Student {isLoading && search && <Text color="medired">Searching...</Text>}</Label>
					<Listbox value={selectedUser} onChange={(val) => setSelectedUser(val)} disabled={!!fetchUsers?.length}>
						{fetchedUsers.map((u) => (
							<ListboxOption value={u.id} key={u.id}>
								<Avatar slot="icon" showFallback className="h-4 w-4" src={`/api/users/${u.id}/avatar`} />
								<ListboxLabel>{`${u?.officialName} ${u?.officialSurname}`}</ListboxLabel>
								<ListboxDescription>{u.id}</ListboxDescription>
							</ListboxOption>
						))}
						{fetchedUsers?.length === 0 && <ListboxOption disabled>No students found.</ListboxOption>}
					</Listbox>
				</Field>
			</DialogBody>
			<DialogActions>
				<Button plain onClick={onClose}>
					Cancel
				</Button>
				<Button
					onClick={() => {
						addStudentToAssignment();
					}}
					disabled={!selectedCommittee || !fetchedUsers.length || (selectedCommittee.type == "GENERALASSEMBLY" && !selectedCountry)}>
					Add
				</Button>
			</DialogActions>
		</Dialog>
	);
}

function DeleteProposalModal({ proposal, setSelectedDeleteProposal }) {
	function onClose() {
		setSelectedDeleteProposal(null);
	}

	return (
		<Dialog open={!!proposal} onClose={onClose}>
			<DialogTitle>Delete Proposal of {proposal.school.name}</DialogTitle>
			<DialogDescription>
				Are you sure you want to delete this proposal? This action is irreversible. To prevent reapplication, also delete their country assignments.
			</DialogDescription>
			<DialogBody>
				<DescriptionList>
					<DescriptionTerm>School Name</DescriptionTerm>
					<DescriptionDetails>{proposal.school.name}</DescriptionDetails>
					<DescriptionTerm>School ID</DescriptionTerm>
					<DescriptionDetails>{proposal.school.id}</DescriptionDetails>
					<DescriptionTerm>Proposal ID</DescriptionTerm>
					<DescriptionDetails>{proposal.id}</DescriptionDetails>
					<DescriptionTerm>Number of Delegates</DescriptionTerm>
					<DescriptionDetails>{proposal.assignment.length}</DescriptionDetails>
				</DescriptionList>
			</DialogBody>
			<DialogActions>
				<Button plain onClick={onClose}>
					Cancel
				</Button>
				<Button color="red">Delete</Button>
			</DialogActions>
		</Dialog>
	);
}
