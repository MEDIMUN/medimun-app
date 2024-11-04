"use client";

import { Divider } from "@/components/divider";
import { Description, Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Switch, SwitchField } from "@/components/switch";
import { useRef, useState, useEffect, Fragment } from "react";
import {
	acceptDelegationDeclaration,
	changeDelegateApplicationStatus,
	isDelegateApplicationsAutoOpenChangeAction,
	isDelegateApplicationsForceOpenChangeAction,
	saveDelegationDeclarationState,
} from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDebouncedValue } from "@mantine/hooks";
import { useUpdateEffect } from "@/hooks/use-update-effect";
import { cn } from "@/lib/cn";
import { Subheading } from "@/components/heading";
import { Text } from "@/components/text";
import { Textarea } from "@/components/textarea";
import { arrayFromNumber } from "@/lib/array-from-number";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import { countries } from "@/data/countries";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/description-list";
import { Badge } from "@/components/badge";
import { School, Session } from "@prisma/client";
import { Button } from "@/components/button";
import Paginator from "@/components/pagination";
import { Pagination } from "@nextui-org/pagination";
import { Field as UnstyledField } from "@headlessui/react";
import Link from "next/link";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { flushSync } from "react-dom";
import { getOrdinal } from "@/lib/get-ordinal";

export function ApplicationOptions({ selectedSession }) {
	const formRef = useRef(null);

	// Separate state for each form field
	const [autoOpenTime, setAutoOpenTime] = useState(selectedSession.delegateApplicationsAutoOpenTime?.toISOString().slice(0, -1) || "");
	const [autoCloseTime, setAutoCloseTime] = useState(selectedSession.delegateApplicationsAutoCloseTime?.toISOString().slice(0, -1) || "");
	const [debouncedAutoOpenTime] = useDebouncedValue(autoOpenTime, 2000);
	const [debouncedAutoCloseTime] = useDebouncedValue(autoCloseTime, 2000);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	// Handle form submission
	async function handleSubmit() {
		setIsLoading(true);
		const formData = new FormData(formRef.current);
		const res = await changeDelegateApplicationStatus(formData, selectedSession.number);
		if (res?.ok) {
			toast.success(res?.message, {
				id: "updated",
			});
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	async function handleIsDelegateApplicationsForceOpenChange(e) {
		setIsLoading(true);
		const res = await isDelegateApplicationsForceOpenChangeAction(e, selectedSession.number);
		if (res?.ok) {
			toast.success(res?.message, {
				id: "updated",
			});
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	async function handleIsDelegateApplicationsAutoOpenChange(e) {
		setIsLoading(true);
		const res = await isDelegateApplicationsAutoOpenChangeAction(e, selectedSession.number);
		if (res?.ok) {
			toast.success(res?.message, {
				id: "updated",
			});
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	// Handle state changes (on form change)
	useUpdateEffect(() => {
		handleSubmit();
	}, [debouncedAutoOpenTime, debouncedAutoCloseTime]);

	return (
		<form ref={formRef} className="rounded-lg bg-zinc-100 px-4 shadow-sm ring-1 ring-zinc-950/10" onSubmit={handleSubmit}>
			<Divider className="invisible mb-10" />
			<SwitchField disabled={!selectedSession.isCurrent || isLoading}>
				<Label>Force Applications Open</Label>
				<Description>If this is on, the applications will be open no matter the below schedule.</Description>
				<Switch
					name="isDelegateApplicationsForceOpen"
					checked={selectedSession.isDelegateApplicationsForceOpen}
					onChange={(e) => handleIsDelegateApplicationsForceOpenChange(e)}
				/>
			</SwitchField>
			<Divider className="my-10" />
			<SwitchField disabled={!selectedSession.isCurrent || isLoading}>
				<Label>Scheduling</Label>
				<Description>When this is on, the below schedule will be respected.</Description>
				<Switch
					name="isDelegateApplicationsAutoOpen"
					checked={selectedSession.isDelegateApplicationsAutoOpen}
					onChange={(e) => handleIsDelegateApplicationsAutoOpenChange(e)}
				/>
			</SwitchField>
			<Divider className={cn("my-10", !selectedSession.isDelegateApplicationsAutoOpen && "invisible mb-0")} />
			{selectedSession.isDelegateApplicationsAutoOpen && (
				<>
					<Field disabled={!selectedSession.isCurrent || isLoading}>
						<Label>Opening Date</Label>
						<Description>When will the applications open.</Description>
						<Input
							type="datetime-local"
							name="delegateApplicationsAutoOpenTime"
							value={autoOpenTime}
							onChange={(e) => setAutoOpenTime(e.target.value)}
						/>
					</Field>

					<Divider className="my-10" />

					<Field disabled={!selectedSession.isCurrent || isLoading}>
						<Label>Closing Date</Label>
						<Description>When will the applications close.</Description>
						<Input
							type="datetime-local"
							name="delegateApplicationsAutoCloseTime"
							value={autoCloseTime}
							onChange={(e) => setAutoCloseTime(e.target.value)}
						/>
					</Field>

					<Divider className="invisible mt-10" />
				</>
			)}
		</form>
	);
}

export function CountryAssign({
	applicationsOfSession,
	selectedSession,
	schools,
}: {
	applicationsOfSession: any[];
	selectedSession: Session;
	schools: School[];
}) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [page, setPage] = useState(1);
	const itemsPerPage = 5;
	const [modalOptions, setModalOptions] = useState(null);

	const schoolIdsOfGrantedDelegations = selectedSession.ApplicationGrantedDelegationCountries.map((d) => d.schoolId);
	const filteredStateArray = selectedSession?.savedDelegationDeclarationState
		? JSON.parse(selectedSession?.savedDelegationDeclarationState)
		: [].filter((s) => !schoolIdsOfGrantedDelegations.includes(s.schoolId)).map((s) => ({ ...s, type: "SOFT" }));

	let newDelegations = [];
	selectedSession.ApplicationGrantedDelegationCountries.forEach((d) => {
		let index = 1;
		d.countries.forEach((c) => {
			newDelegations.push({ schoolId: d.schoolId, delegationNumber: index, country: c, type: "HARD" });
			index++;
		});
	});

	const finalStateArray = [...filteredStateArray, ...newDelegations];

	const [softAssignedCountries, setSoftAssignedCountries] = useState(finalStateArray);
	const [debouncedSoftAssignedCountries] = useDebouncedValue(softAssignedCountries, 2000);

	const handleSoftAssignChange = (application: DelegationDeclaration, index: number, country: string) => {
		let newSoftAssignedCountries = [...softAssignedCountries];
		newSoftAssignedCountries = newSoftAssignedCountries.filter(
			(softAssignedCountry) => !(softAssignedCountry.schoolId === application.schoolId && softAssignedCountry.delegationNumber === index + 1)
		);
		newSoftAssignedCountries.push({
			schoolId: application.schoolId,
			delegationNumber: index + 1,
			country,
		});
		setSoftAssignedCountries(newSoftAssignedCountries);
	};

	async function handleAcceptDelegation() {
		if (isLoading) return;
		setIsLoading(true);
		const countriesOfSchool = softAssignedCountries.filter((c) => c.schoolId === modalOptions.schoolId).map((c) => c.country);
		const res = await acceptDelegationDeclaration(modalOptions.schoolId, countriesOfSchool, selectedSession.id);
		if (res?.ok) {
			toast.success(...res?.message);
			setModalOptions(null);
			flushSync(() => router.refresh());
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	useEffect(() => {
		async function saveState() {
			if (debouncedSoftAssignedCountries.length === 0) return;
			const res = await saveDelegationDeclarationState(debouncedSoftAssignedCountries, selectedSession.id);
			if (res?.ok) {
				toast.success(res?.message, {
					id: "updated",
				});
			} else {
				toast.error(res?.message);
			}
		}
		saveState();
	}, [debouncedSoftAssignedCountries]);

	return (
		<>
			<Dialog open={!!modalOptions} onClose={() => setModalOptions(null)}>
				<DialogTitle>Accept Delegation</DialogTitle>
				<DialogDescription>
					Are you sure you want to accept the delegation declaration of the school? This action cannot be undone and the countries assigned to the
					school will not be available anymore.
				</DialogDescription>
				<DialogBody>
					<DescriptionList>
						<DescriptionTerm>Application ID</DescriptionTerm>
						<DescriptionDetails>{modalOptions?.id}</DescriptionDetails>

						<DescriptionTerm>School Name</DescriptionTerm>
						<DescriptionDetails>{modalOptions?.school.name}</DescriptionDetails>

						<DescriptionTerm>Application Date</DescriptionTerm>
						<DescriptionDetails>{new Date(modalOptions?.date).toLocaleString("en-GB").replace(",", " at ")}</DescriptionDetails>

						<DescriptionTerm>Original Number of Requested General Assembly Delegations</DescriptionTerm>
						<DescriptionDetails>{modalOptions?.numberOfGACountries}</DescriptionDetails>

						<DescriptionTerm>Number of Assigned GA Delegations</DescriptionTerm>
						<DescriptionDetails>
							{
								softAssignedCountries
									.filter((softAssignedCountry) => softAssignedCountry.schoolId === modalOptions?.schoolId)
									.filter((softAssignedCountry) => softAssignedCountry.country !== "NOTGRANTED").length
							}
						</DescriptionDetails>

						<DescriptionTerm>Country Preferences</DescriptionTerm>
						<DescriptionDetails className="flex flex-wrap gap-1">
							{modalOptions?.countyPreferences.map((country) => {
								const selectedCountry = countries.find((c) => c.countryCode === country);
								return (
									<Badge
										color={
											//if the country is assigned to this specific school green else yellow
											softAssignedCountries
												.filter((c) => c.schoolId === modalOptions?.schoolId && c.country === country)
												.some((c) => c.country === country)
												? "green"
												: "yellow"
										}
										key={country}>
										{selectedCountry?.flag} {selectedCountry?.countryNameEn}
									</Badge>
								);
							})}
						</DescriptionDetails>

						<DescriptionTerm>Assigned Delegations and Countries</DescriptionTerm>
						<DescriptionDetails className="flex flex-wrap gap-1">
							{softAssignedCountries
								.filter((softAssignedCountry) => softAssignedCountry.schoolId === modalOptions?.schoolId)
								.sort((a, b) => {
									if (a.country === "NOTGRANTED") return 1;
									if (b.country === "NOTGRANTED") return -1;
									return 0;
								})
								.map((softAssignedCountry) => {
									if (softAssignedCountry.country == "NOTGRANTED")
										return (
											<Badge key={softAssignedCountry.country} color="red">
												Delegation Not Granted
											</Badge>
										);
									const selectedCountry = countries.find((c) => c.countryCode === softAssignedCountry.country);
									return (
										<Badge className="my-auto max-h-min" color="green" key={softAssignedCountry.country}>
											{selectedCountry?.flag} {selectedCountry?.countryNameEn}
										</Badge>
									);
								})}
						</DescriptionDetails>
					</DescriptionList>
				</DialogBody>
				<DialogActions>
					<Button onClick={() => setModalOptions(null)} disabled={isLoading} loading={isLoading} plain>
						Cancel
					</Button>
					<Button onClick={handleAcceptDelegation} disabled={isLoading} loading={isLoading} color="red">
						Accept
					</Button>
				</DialogActions>
			</Dialog>

			<div className="rounded-lg bg-zinc-100 px-4 py-1 ring-1 ring-zinc-950/10">
				<DescriptionList>
					{[...new Set(selectedSession.countriesOfSession)].map((country) => {
						const selectedCountry = countries.find((c) => c.countryCode === country);
						return (
							<Fragment key={country}>
								<DescriptionTerm>
									<Text>
										{selectedCountry?.flag} {selectedCountry?.countryNameEn}
									</Text>
								</DescriptionTerm>
								<DescriptionDetails>
									{softAssignedCountries.find(
										(softAssignedCountry) => softAssignedCountry.country === country && softAssignedCountry.type === "HARD"
									) ? (
										<Badge color="red">
											Taken 💔 by{" "}
											{
												schools.find(
													(school) =>
														school.id ===
														softAssignedCountries.find(
															(softAssignedCountry) => softAssignedCountry.country === country && softAssignedCountry.type === "HARD"
														).schoolId
												)?.name
											}
										</Badge>
									) : (
										softAssignedCountries.find((softAssignedCountry) => softAssignedCountry.country === country) && (
											<Text>
												Soft Assigned to{" "}
												{
													schools.find(
														(school) =>
															school.id === softAssignedCountries.find((softAssignedCountry) => softAssignedCountry.country === country)?.schoolId
													)?.name
												}
											</Text>
										)
									)}
									{!softAssignedCountries.some((c) => c.country === country) && <Badge color="green">Available</Badge>}
								</DescriptionDetails>
							</Fragment>
						);
					})}
				</DescriptionList>
			</div>

			{applicationsOfSession?.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((application) => {
				const isDisabled = selectedSession?.ApplicationGrantedDelegationCountries?.some((delegation) => delegation.schoolId === application.schoolId);
				return (
					<li key={application.schoolId} className="flex flex-col gap-x-8 gap-y-6 rounded-lg bg-zinc-100 p-4 ring-1 ring-zinc-950/10 md:flex-col">
						<div className="space-y-1">
							<DescriptionList>
								<DescriptionTerm>School Name</DescriptionTerm>
								<DescriptionDetails>
									<Link href={`/medibook/schools/${application.school.slug || application.schoolId}`}>{application.school.name}</Link>
								</DescriptionDetails>

								<DescriptionTerm>Application Status</DescriptionTerm>
								<DescriptionDetails>
									{isDisabled ? <Badge color="green">Sent Back for Final Assignment</Badge> : <Badge color="yellow">Pending</Badge>}
								</DescriptionDetails>

								<DescriptionTerm>Application Date</DescriptionTerm>
								<DescriptionDetails>{new Date(application.date).toLocaleString("en-GB").replace(",", " at ")}</DescriptionDetails>

								<DescriptionTerm>Requested Number of Delegations</DescriptionTerm>
								<DescriptionDetails>{application.numberOfGACountries}</DescriptionDetails>

								<DescriptionTerm>Country Preferences</DescriptionTerm>
								<DescriptionDetails className="flex flex-wrap gap-1">
									{application.countyPreferences.map((country, index) => {
										const selectedCountry = countries.find((c) => c.countryCode === country);
										return (
											<Badge color={softAssignedCountries.some((c) => c.country === country) ? "yellow" : "red"} key={country}>
												<span>
													{index + 1}
													<sup>{getOrdinal(index + 1)}</sup>
												</span>
												{selectedCountry?.flag} {selectedCountry?.countryNameEn}
											</Badge>
										);
									})}
								</DescriptionDetails>
							</DescriptionList>
						</div>

						<div className="my-auto grid grid-cols-1 gap-4 md:gap-2 md:gap-x-6 lg:grid-cols-2">
							{arrayFromNumber(application.numberOfGACountries).map((_, index) => {
								return (
									<UnstyledField key={index} className="flex flex-col gap-2 md:flex-row">
										<Label className="my-auto min-w-[100px] md:min-w-[85px]">Delegation {index + 1}</Label>
										<Listbox
											className="mb-auto overflow-hidden"
											key={index}
											value={
												softAssignedCountries.find(
													(softAssignedCountry) =>
														softAssignedCountry.schoolId === application.schoolId && softAssignedCountry.delegationNumber === index + 1
												)?.country || null
											}
											disabled={isDisabled}
											onChange={(val) => handleSoftAssignChange(application, index, val)}>
											<ListboxOption value="NOTGRANTED">Don&apos;t Grant Delegation Request</ListboxOption>
											{[
												...new Set(
													selectedSession.countriesOfSession.filter((country) => {
														const assignedToCurrentDelegation = softAssignedCountries.some(
															(softAssignedCountry) =>
																softAssignedCountry.schoolId === application.schoolId &&
																softAssignedCountry.delegationNumber === index + 1 &&
																softAssignedCountry.country === country
														);
														const assignedToOtherDelegation = softAssignedCountries.some(
															(softAssignedCountry) =>
																softAssignedCountry.country === country &&
																(softAssignedCountry.schoolId !== application.schoolId || softAssignedCountry.delegationNumber !== index + 1)
														);
														return assignedToCurrentDelegation || !assignedToOtherDelegation;
													})
												),
											].map((country) => {
												const selectedCountry = countries.find((c) => c.countryCode === country);
												return (
													<ListboxOption key={country} value={country}>
														<ListboxLabel>
															{selectedCountry?.flag} {selectedCountry?.countryNameEn}
														</ListboxLabel>
														{selectedSession.securityCouncilCountriesOfYear.includes(country) && <ListboxDescription>UNSC Member</ListboxDescription>}
													</ListboxOption>
												);
											})}
										</Listbox>
									</UnstyledField>
								);
							})}
						</div>
						{!isDisabled && (
							<div className="col-span-2 flex w-full justify-end">
								<Button
									disabled={softAssignedCountries.filter((c) => c.schoolId === application.schoolId).length !== application.numberOfGACountries}
									onClick={() => {
										if (softAssignedCountries.filter((c) => c.schoolId === application.schoolId).length !== application.numberOfGACountries) {
											return;
										}
										setModalOptions(application);
									}}
									className="w-full md:w-auto"
									color="red">
									Save & Send Back
								</Button>
							</div>
						)}
					</li>
				);
			})}

			{/* Pagination controls */}
			<Paginator
				control={{
					total: Math.ceil(applicationsOfSession.length / itemsPerPage) || 1,
					page,
					onChange: setPage,
				}}
			/>
		</>
	);
}
