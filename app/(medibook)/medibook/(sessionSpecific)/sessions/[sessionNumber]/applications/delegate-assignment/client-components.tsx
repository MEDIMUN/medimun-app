"use client";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/description-list";
import Icon from "@/components/icon";
import { Code, Text } from "@/components/text";
import { countries } from "@/data/countries";
import { cn } from "@/lib/cn";
import { Avatar } from "@nextui-org/avatar";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { handleFinalAssignDelegates } from "./actions";
import { Divider } from "@/components/divider";

export function FinalAssignDelegates({ users, delegateProposals, selectedSession }) {
	const [rejectedNominations, setRejectedNominations] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	async function handleSubmit(assignments, schoolId) {
		const filteredAssignments = assignments.filter((a) => !rejectedNominations.includes(a.studentId));
		if (filteredAssignments.length === 0) {
			toast.error("You cannot assign 0 delegates.");
			return;
		}
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

	// send the data to the server

	return (
		<>
			{!!delegateProposals.length && (
				<ul className="space-y-4">
					{delegateProposals.map((proposal) => {
						if (!!proposal.school.finalDelegation.length) {
							return (
								<li
									key={proposal.id + Math.random()}
									className="flex flex-col gap-x-8 gap-y-6 rounded-lg bg-zinc-100 px-4 ring-1 ring-zinc-950/10 md:flex-col">
									<DescriptionList>
										<DescriptionTerm>School Name</DescriptionTerm>
										<DescriptionDetails>{proposal.school.name}</DescriptionDetails>

										<DescriptionTerm>Delegation ID</DescriptionTerm>
										<DescriptionDetails>{proposal.school.finalDelegation[0].id}</DescriptionDetails>

										<DescriptionTerm>Application Status</DescriptionTerm>
										<DescriptionDetails>
											<Badge color="green">Accepted</Badge>
										</DescriptionDetails>

										<DescriptionTerm>Assignments</DescriptionTerm>
										<DescriptionDetails>
											<DescriptionList>
												{JSON.parse(proposal.school.finalDelegation[0].delegation).map((a) => {
													const student = users.find((u) => u.id === a.studentId);
													const committee = selectedSession.committee.find((c) => c.id === a.committeeId);
													const country = countries.find((c) => c.countryCode === a.countryCode);
													return (
														<Fragment key={committee.id + student.id}>
															<DescriptionTerm className="space-x-2">
																<Badge>{committee.name}</Badge>
																{country && (
																	<Badge>
																		{country?.flag} {country?.countryNameEn}
																	</Badge>
																)}
															</DescriptionTerm>
															<DescriptionDetails>
																<Badge color="">
																	<Avatar showFallback className="h-4 w-4 bg-primary text-white" src={`/api/users/${student.id}/avatar`} />
																	{student.displayName || `${student.officialName} ${student.officialSurname}`}{" "}
																	<span className="font-light">{a.studentId}</span>
																</Badge>
															</DescriptionDetails>
														</Fragment>
													);
												})}
											</DescriptionList>
										</DescriptionDetails>
									</DescriptionList>
								</li>
							);
						}
						return (
							<li key={proposal.id} className="flex flex-col gap-x-8 gap-y-6 rounded-lg bg-zinc-100 px-4 ring-1 ring-zinc-950/10 md:flex-col">
								<DescriptionList>
									<DescriptionTerm>School Name</DescriptionTerm>
									<DescriptionDetails>
										{proposal.school.name} <Code>{proposal.school.id}</Code>
									</DescriptionDetails>

									<DescriptionTerm>Application ID</DescriptionTerm>
									<DescriptionDetails>{proposal.id}</DescriptionDetails>

									<DescriptionTerm>Delegates Proposed</DescriptionTerm>
									<DescriptionDetails>{`${proposal.assignment.filter((a) => a.countryCode).length} GA Delegates and ${proposal.assignment.filter((a) => !a.countryCode).length} Experienced Delegates`}</DescriptionDetails>

									<DescriptionTerm>General Assembly Assignments</DescriptionTerm>
									<DescriptionDetails>
										<div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
											{proposal.assignment
												.filter((a) => a.countryCode)
												.map((a, index) => {
													const student = users.find((u) => u.id === a.studentId);
													const committee = selectedSession.committee.find((c) => c.id === a.committeeId);
													const country = countries.find((c) => c.countryCode === a.countryCode);
													return (
														<Fragment key={proposal.id + country?.countryCode + committee.id}>
															<Badge color="" className="!px-0">
																{committee.name} {country.flag} {country.countryNameEn}
															</Badge>
															<Badge className="max-w-max">
																<Avatar showFallback className="h-4 w-4 bg-primary text-white" src={`/api/users/${student.id}/avatar`} />
																{student.displayName || `${student.officialName} ${student.officialSurname}`}{" "}
																<span className="font-light">{a.studentId}</span>
															</Badge>
															{!(index == proposal.assignment.filter((a) => a.countryCode).length - 1) && (
																<Divider soft className="col-span-1-1 xl:col-span-2" />
															)}
														</Fragment>
													);
												})}
										</div>
									</DescriptionDetails>
									<DescriptionTerm>Security Council & Special Committee Nominations</DescriptionTerm>
									<DescriptionDetails>
										<Text className="mb-2">
											Clicking <Code>Reject Nomination</Code> will not take effect until you click <Code>Confirm</Code>.
										</Text>
										<ul className="flex flex-col gap-3">
											{proposal.assignment
												.filter((a) => !a.countryCode)
												.map((a, index) => {
													const student = users.find((u) => u.id === a.studentId);
													const committee = selectedSession.committee.find((c) => c.id === a.committeeId);
													const isRejected = rejectedNominations.includes(a.studentId);
													return (
														<li
															key={index + Math.random()}
															className="flex flex-col gap-2 rounded-lg bg-zinc-50 p-3 ring-1 ring-zinc-950/10 md:flex-col">
															<Text>{committee.name}</Text>
															<Badge color="" className="m-0 my-auto !p-0">
																<Avatar showFallback className="h-4 max-h-max w-4 bg-primary text-white" src={`/api/users/${student.id}/avatar`} />
																{student.displayName || `${student.officialName} ${student.officialSurname}`}{" "}
																<span className="font-light">{a.studentId}</span>
															</Badge>
															<Button
																onClick={() => {
																	if (!isRejected) {
																		setRejectedNominations([...rejectedNominations, a.studentId]);
																	} else {
																		setRejectedNominations(rejectedNominations.filter((id) => id !== a.studentId));
																	}
																}}
																className={cn("h-8 w-full", "")}
																color={isRejected ? "green" : ("red" as "green" | "red")}>
																{isRejected ? "Undo Rejection" : "Reject Nomination"}
															</Button>
														</li>
													);
												})}
										</ul>
									</DescriptionDetails>
								</DescriptionList>
								<Button
									onClick={() => {
										handleSubmit(proposal.assignment, proposal.school.id);
									}}
									className="mb-4"
									color="green">
									Confirm
								</Button>
							</li>
						);
					})}
				</ul>
			)}
		</>
	);
}
