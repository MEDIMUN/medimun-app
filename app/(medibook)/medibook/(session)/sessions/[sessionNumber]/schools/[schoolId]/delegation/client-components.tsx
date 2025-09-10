"use client";
import { Button } from "@/components/button";
import { Divider } from "@/components/divider";
import { Subheading } from "@/components/heading";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import { Text } from "@/components/text";
import { arrayFromNumber } from "@/lib/array-from-number";
import { getOrdinal } from "@/lib/get-ordinal";
import { useEffect, useState } from "react";
import { delegationPeopleAssignment, submitDelegationDeclaration } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Avatar } from "@heroui/avatar";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { SearchParamsDropDropdownItem } from "@/app/(medibook)/medibook/client-components";
import { Checkbox } from "@/components/checkbox";
import { Badge } from "@/components/badge";
import Paginator from "@/components/pagination";
import { countries } from "@/data/countries";
import { Label } from "@/components/fieldset";
import { Field as UnstyledField } from "@headlessui/react";
import { Input } from "@/components/input";
import { useDebouncedValue } from "@mantine/hooks";
import { removeSearchParams, updateSearchParams } from "@/lib/search-params";
import { cn } from "@/lib/cn";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Ellipsis } from "lucide-react";

export function SelectCountriesSection({ selectedSchool, filteredCountries, selectedSession, numberOfGACommittees }) {
	const [selectedArray, setSelectedArray] = useState(arrayFromNumber(10).map(() => ""));
	const [numberOfDelegations, setNumberOfDelegations] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	async function handleSubmit() {
		setIsLoading(true);
		const res = await submitDelegationDeclaration(selectedSchool.id, numberOfDelegations, selectedArray);
		if (res?.ok) {
			toast.success(res?.message);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	let maxNoOfDels = selectedSession.maxNumberOfGeneralAssemblyDelegationsPerSchool;
	if (selectedSchool.name == "The English School") {
		maxNoOfDels = 250;
	}

	return (
		<>
			<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
				<div className="space-y-1">
					<Subheading>Number of General Assembly Delegations Requested</Subheading>
					<Text>
						Select the number of delegations you are willing to bring. Each delegation can contain up to {numberOfGACommittees} delegates who will be
						present in a General Assembly Committee. On top of this number you will be able to select a number of delegates to be present in Special
						Committees at a later application space. You will also be assigned a delegation country for each delegation.
					</Text>
				</div>
				<div className="my-auto">
					<Listbox disabled={isLoading} value={numberOfDelegations} onChange={(value) => setNumberOfDelegations(value)}>
						{arrayFromNumber(maxNoOfDels).map((number) => (
							<ListboxOption key={number + Math.random()} value={number}>
								<ListboxLabel>
									{number} Delegation{number > 1 && "s"}
								</ListboxLabel>
								<ListboxDescription>
									{number * numberOfGACommittees - (numberOfGACommittees - 1)} to {number * numberOfGACommittees} Delegates in GAs
								</ListboxDescription>
							</ListboxOption>
						))}
					</Listbox>
				</div>
			</section>
			<Divider className="my-10" soft />
			<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
				<div className="space-y-1">
					<Subheading>Preferred Countries</Subheading>
					<Text>
						Select 10 countries in order of preference to be assigned to your delegations. Countries are assigned in a first come first serve basis.
						You may not be assigned any of the countries you select.
					</Text>
				</div>
				<div className="my-auto grid grid-cols-1 gap-2">
					{arrayFromNumber(10).map((number) => (
						<div key={number + Math.random()} className="flex flex-row gap-2">
							<div className="my-auto min-w-24">
								<Text className="min-w-max">
									{number}
									<sup>{getOrdinal(number)}</sup> Choice
								</Text>
							</div>
							<div className="max-w-auto w-full overflow-hidden">
								<Listbox
									disabled={isLoading}
									className=""
									value={selectedArray[number - 1]}
									onChange={(value) => {
										setSelectedArray((prev) => {
											const newArray = [...prev];
											newArray[number - 1] = value;
											return newArray;
										});
									}}>
									{filteredCountries
										.filter((country) => !selectedArray.includes(country.countryCode) || selectedArray[number - 1] === country.countryCode)
										.map((country) => (
											<ListboxOption key={country.countryCode} value={country.countryCode}>
												<ListboxLabel>
													{country.flag} {country.countryNameEn}
												</ListboxLabel>
												{selectedSession.securityCouncilCountriesOfYear.includes(country.countryCode) && (
													<ListboxDescription>UNSC Member</ListboxDescription>
												)}
											</ListboxOption>
										))}
								</Listbox>
							</div>
						</div>
					))}
				</div>
			</section>
			<Divider className="my-10" soft />
			<div className="flex justify-end gap-4">
				<Button
					plain
					onClick={() => {
						setSelectedArray(arrayFromNumber(10).map(() => ""));
					}}>
					Reset
				</Button>
				<Button disabled={!selectedArray.every((value) => value !== "")} color="red" type="button" onClick={handleSubmit}>
					Submit Application
				</Button>
			</div>
		</>
	);
}

export function SelectStudents({ students, selectedSession, grantedDelegation, numberOfStudents }) {
	const [selectedStudents, setSelectedStudents] = useState([]);
	const [search, setSearch] = useState("");
	const [debouncedSearch] = useDebouncedValue(search, 500);
	const [isLoading, setIsLoading] = useState(false);
	const [stage, setStage] = useState(1);
	const router = useRouter();
	const generalAssemblyCommitties = selectedSession.committee.filter((committee) => committee.type === "GENERALASSEMBLY");
	const specialAndSecurityCommitties = selectedSession.committee.filter((committee) => committee.type !== "GENERALASSEMBLY");
	const generalAssemblyCountries = grantedDelegation?.countries?.filter((country) => country !== "NOTGRANTED");
	const [assignedStudents, setAssignedStudents] = useState([]);

	const maxNumberOfDelegates = generalAssemblyCommitties?.length * generalAssemblyCountries?.length + specialAndSecurityCommitties?.length;
	const minNumberOfDelegates = generalAssemblyCommitties.length * (generalAssemblyCountries.length - 1) + 1;

	async function handleSubmit() {
		setIsLoading(true);
		const res = await delegationPeopleAssignment(assignedStudents, grantedDelegation.schoolId, selectedSession.id);
		if (res?.ok) {
			router.refresh();
			setStage(2);
			toast.success(...res?.message);
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	useEffect(() => {
		if (debouncedSearch) {
			updateSearchParams({ search: debouncedSearch }, router);
		} else {
			removeSearchParams({ search: "" }, router);
		}
	}, [debouncedSearch, router]);

	if (!!students.length && (stage == 2 || stage == 3))
		return (
			<>
				<Dialog
					open={stage == 3}
					onClose={() => {
						setStage(2);
					}}>
					<DialogTitle>
						Assign Delegates{" "}
						<Badge className="-translate-y-[2px]" color="red">
							Final Submission
						</Badge>
					</DialogTitle>
					<DialogDescription>
						After you click submit you will not be able to change the assigned delegates without submitting a separate a change request. After we
						receive your application we will confirm you the assigned delegates, accept or reject your Security Council and Special Committee
						Delegates and you will receive an invoice for the participation fee.
						<br />
						<br />
						If we find a problem with your assignment we may ask you to complete this part of the application again, in such a case when you visit
						this page you will see the delegation assignment form again.
						<br />
						<br />
						<b>Please don&apos;t submit this form with missing info or with delegates who have not confirmed their participation yet.</b>
					</DialogDescription>
					<DialogBody></DialogBody>
					<DialogActions>
						<Button
							plain
							onClick={() => {
								setStage(2);
							}}>
							Cancel
						</Button>
						<Button
							onClick={handleSubmit}
							color="red"
							disabled={assignedStudents.length < minNumberOfDelegates || assignedStudents.length > maxNumberOfDelegates}>
							Submit
						</Button>
					</DialogActions>
				</Dialog>
				<div className="flex w-full flex-col gap-3 rounded-md bg-zinc-50 px-4 py-4">
					<h3 className=" text-sm font-medium text-zinc-800">
						Please select between {minNumberOfDelegates} and {maxNumberOfDelegates} delegates.
					</h3>
					<div className="w-full">
						<div className="flex flex-col gap-3">
							<div className="flex flex-wrap gap-1">
								{selectedStudents.map((student) => {
									return (
										<Badge
											key={student.id}
											onClick={() => {
												if (!assignedStudents.find((assignedStudent) => assignedStudent.studentId === student.id)) return;
												const removeStudentIdFromAssignedStudents = assignedStudents.filter(
													(assignedStudent) => assignedStudent.studentId !== student.id
												);
												setAssignedStudents(removeStudentIdFromAssignedStudents);
											}}
											className={cn(
												assignedStudents.find((assignedStudent) => assignedStudent.studentId === student.id) &&
													"cursor-pointer bg-primary! text-white! hover:line-through"
											)}>
											<Avatar showFallback className="h-4 w-4 bg-primary text-white" src={`/api/users/${student.id}/avatar`} />
											{`${student.officialName} ${student.officialSurname}`}
										</Badge>
									);
								})}
							</div>
							<div className="flex w-full flex-col justify-between gap-2 md:flex-row">
								<p className="mt-auto text-xs italic">
									{assignedStudents.length} / {maxNumberOfDelegates} assigned.
								</p>
								<div className="flex flex-col gap-2 md:flex-row">
									<Button
										plain
										onClick={() => {
											setAssignedStudents([]);
										}}
										disabled={selectedStudents.length === 0}>
										Reset Students
									</Button>
									<Button
										plain
										onClick={() => {
											setStage(1);
										}}>
										Back to Student Selection
									</Button>
									<Button
										plain
										onClick={() => {
											setStage(3);
										}}
										color="red"
										disabled={assignedStudents.length < minNumberOfDelegates || assignedStudents.length > maxNumberOfDelegates}>
										Submit
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
				{generalAssemblyCountries.map((country, index) => {
					const selectedCountry = countries.find((c) => c.countryCode === country);
					return (
						<div key={index + Math.random()} className="w-full rounded-md bg-zinc-50 px-4">
							<Subheading className="mt-3">
								<span className="font-light">General Assembly Delegation {index + 1}</span> {selectedCountry.countryNameEn} {selectedCountry.flag}
							</Subheading>
							<div className="flex flex-col gap-3 py-3 pb-4">
								{generalAssemblyCommitties.map((committee, committeeIndex) => {
									return (
										<UnstyledField key={index + Math.random()} className="flex flex-col gap-2 md:flex-row">
											<Label className="my-auto min-w-[100px] md:min-w-[135px]">{committee.name}</Label>
											<Listbox
												value={
													assignedStudents.find(
														(assignedStudent) =>
															assignedStudent.committeeId === committee.id && assignedStudent.countryCode === selectedCountry.countryCode
													)?.studentId || "EMPTY"
												}
												onChange={(value) => {
													const filteredAssignedStudents = assignedStudents.filter(
														(assignedStudent) =>
															!(assignedStudent.committeeId === committee.id && assignedStudent.countryCode === selectedCountry.countryCode)
													);
													const newAssignedStudent = {
														studentId: value,
														committeeId: committee.id,
														countryCode: selectedCountry.countryCode,
													};
													if (value !== "EMPTY") {
														setAssignedStudents([...filteredAssignedStudents, newAssignedStudent]);
													} else {
														setAssignedStudents(filteredAssignedStudents);
													}
												}}>
												<ListboxOption value={"EMPTY"}>No Delegate</ListboxOption>
												{selectedStudents
													.filter((student) => {
														const assignedToOtherDelegationAndCountry = assignedStudents.find(
															(assignedStudent) =>
																assignedStudent.studentId === student.id &&
																(assignedStudent.committeeId !== committee.id || assignedStudent.countryCode !== selectedCountry.countryCode)
														);
														const assignedToCurrentDelegationAndCountry = assignedStudents.find(
															(assignedStudent) =>
																assignedStudent.studentId === student.id &&
																assignedStudent.committeeId === committee.id &&
																assignedStudent.countryCode === selectedCountry.countryCode
														);
														return !assignedToOtherDelegationAndCountry || assignedToCurrentDelegationAndCountry;
													})
													.map((student) => {
														return (
															<ListboxOption key={student.id} value={student.id}>
																<Avatar showFallback className="h-5 w-5 bg-primary text-white" src={`/api/users/${student.id}/avatar`} />
																<ListboxLabel>{`${student.officialName} ${student.officialSurname}`}</ListboxLabel>
																<ListboxDescription className="line-clamp-2">
																	<span className="font-semibold">{student.id}</span> ({student.email})
																</ListboxDescription>
															</ListboxOption>
														);
													})}
											</Listbox>
										</UnstyledField>
									);
								})}
							</div>
						</div>
					);
				})}
				{specialAndSecurityCommitties.map((committee, committeeIndex) => {
					return (
						<div key={committeeIndex + Math.random()} className="w-full rounded-md bg-zinc-50 px-4">
							<Subheading className="mt-3">
								<span className="font-light">Special Committee & Security Council Nomination {committeeIndex + 1}</span> {committee.name}
							</Subheading>
							<div className="flex flex-col gap-3 py-3 pb-4">
								<UnstyledField key={committeeIndex + Math.random()} className="flex flex-col gap-2 md:flex-row">
									<Label className="my-auto w-[256px] min-w-max">{committee.name}</Label>
									<Listbox
										value={assignedStudents.find((assignedStudent) => assignedStudent.committeeId === committee.id)?.studentId || "EMPTY"}
										onChange={(value) => {
											const filteredAssignedStudents = assignedStudents.filter((assignedStudent) => !(assignedStudent.committeeId === committee.id));
											const newAssignedStudent = {
												studentId: value,
												committeeId: committee.id,
											};
											if (value !== "EMPTY") {
												setAssignedStudents([...filteredAssignedStudents, newAssignedStudent]);
											} else {
												setAssignedStudents(filteredAssignedStudents);
											}
										}}>
										<ListboxOption value={"EMPTY"}>Don&apos;t Nominate Delegate</ListboxOption>
										{selectedStudents
											.filter((student) => {
												const assignedToOtherDelegationAndCountry = assignedStudents.find(
													(assignedStudent) => assignedStudent.studentId === student.id && assignedStudent.committeeId !== committee.id
												);
												const assignedToCurrentDelegationAndCountry = assignedStudents.find(
													(assignedStudent) => assignedStudent.studentId === student.id && assignedStudent.committeeId === committee.id
												);
												return !assignedToOtherDelegationAndCountry || assignedToCurrentDelegationAndCountry;
											})
											.map((student) => {
												return (
													<ListboxOption key={student.id} value={student.id}>
														<Avatar showFallback className="h-5 w-5 bg-primary text-white" src={`/api/users/${student.id}/avatar`} />
														<ListboxLabel>{`${student.officialName} ${student.officialSurname}`}</ListboxLabel>
														<ListboxDescription className="line-clamp-2">
															<span className="font-semibold">{student.id}</span> ({student.email})
														</ListboxDescription>
													</ListboxOption>
												);
											})}
									</Listbox>
								</UnstyledField>
							</div>
						</div>
					);
				})}
			</>
		);

	if (stage == 1)
		return (
			<>
				<div className="w-full rounded-md bg-zinc-50 px-4 py-4">
					<div className="w-full">
						<div className="flex flex-col gap-2">
							<h3 className=" text-sm font-medium text-zinc-800">
								Please select between {minNumberOfDelegates} and {maxNumberOfDelegates} delegates.
							</h3>
							<div className="flex flex-wrap gap-2">
								{selectedStudents.map((student) => {
									return (
										<Badge
											key={student.id}
											onClick={() => {
												setSelectedStudents(selectedStudents.filter((selectedStudent) => selectedStudent.id !== student.id));
											}}
											className="cursor-pointer hover:bg-primary hover:text-white hover:line-through">
											<Avatar showFallback className="h-4 w-4 bg-primary text-white" src={`/api/users/${student.id}/avatar`} />
											{`${student.officialName} ${student.officialSurname}`}
										</Badge>
									);
								})}
							</div>
							<div className="flex w-full justify-between">
								<p className="mt-auto text-xs italic">
									{selectedStudents.length} / {maxNumberOfDelegates} selected.
								</p>
								<div className="flex gap-2">
									<Button
										onClick={() => {
											setSelectedStudents([]);
										}}
										disabled={selectedStudents.length === 0}
										plain>
										Deselect All
									</Button>
									<Button
										disabled={selectedStudents.length < minNumberOfDelegates || selectedStudents.length > maxNumberOfDelegates}
										onClick={() => {
											setStage(2);
										}}>
										Next
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div>
					<Input
						label="Search"
						type="search"
						placeholder="Search for a student to select..."
						onChange={(e) => {
							setSearch(e.target.value);
						}}
					/>
				</div>
				<Table>
					<TableHead>
						<TableRow>
							<TableHeader>
								<span className="sr-only">Select Student</span>
							</TableHeader>

							<TableHeader>
								<span className="sr-only">Profile Picture</span>
							</TableHeader>
							<TableHeader>User ID</TableHeader>
							<TableHeader>Official Name</TableHeader>
							<TableHeader>Official Surname</TableHeader>
							<TableHeader>Email</TableHeader>
							<TableHeader>
								<span className="sr-only">Actions</span>
							</TableHeader>
						</TableRow>
					</TableHead>

					<TableBody>
						{students?.map((student) => {
							return (
								<TableRow key={student.id}>
									<TableCell>
										<Checkbox
											onChange={(val) => {
												if (!val) setSelectedStudents(selectedStudents.filter((selectedStudent) => selectedStudent.id !== student.id));
												if (val && selectedStudents.length < maxNumberOfDelegates) setSelectedStudents([...selectedStudents, student]);
											}}
											checked={!!selectedStudents.find((selectedStudent) => selectedStudent.id === student.id)}
										/>
									</TableCell>
									<TableCell>
										<Avatar showFallback radius="md" className="" src={`/api/users/${student.id}/avatar`} />
									</TableCell>
									<TableCell className="font-mono">{student.id}</TableCell>

									<TableCell>{student.officialName}</TableCell>

									<TableCell>{student.officialSurname}</TableCell>

									<TableCell>{student.email}</TableCell>

									<TableCell>
										<Dropdown>
											<DropdownButton plain aria-label="More options">
												<Ellipsis width={18} />
											</DropdownButton>
											<DropdownMenu>
												<SearchParamsDropDropdownItem searchParams={{ edituser: student.id }}>Edit User</SearchParamsDropDropdownItem>
												<SearchParamsDropDropdownItem searchParams={{ unafilliatestudent: student.id }}>
													Unafilliate Student
												</SearchParamsDropDropdownItem>
												<DropdownItem href={`/medibook/users/${student.username || student.id}`}>Profile Page</DropdownItem>
											</DropdownMenu>
										</Dropdown>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
				<Paginator totalItems={numberOfStudents} itemsPerPage={10} itemsOnPage={students.length} />
			</>
		);
}
