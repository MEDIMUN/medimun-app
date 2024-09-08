"use client";

import { Divider } from "@/components/divider";
import { Description, Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Switch, SwitchField } from "@/components/switch";
import { useRef, useState, useEffect, Fragment } from "react";
import { changeDelegateApplicationStatus, isDelegateApplicationsAutoOpenChangeAction, isDelegateApplicationsForceOpenChangeAction } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDebouncedValue } from "@mantine/hooks";
import { useUpdateEffect } from "@/hooks/useUpdateEffect";
import { cn } from "@/lib/cn";
import { Subheading } from "@/components/heading";
import { Text } from "@/components/text";
import { Textarea } from "@/components/textarea";
import { arrayFromNumber } from "@/lib/arrayFromNumber";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import { countries } from "@/data/countries";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/description-list";
import { Badge } from "@/components/badge";
import { DelegationDeclaration, Session } from "@prisma/client";
import { Button } from "@/components/button";
import Paginator from "@/components/pagination";
import { Pagination } from "@nextui-org/pagination";
import Link from "next/link";

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
			toast.success(res?.message);
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
			toast.success(res?.message);
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
			toast.success(res?.message);
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
		<form ref={formRef} className="mt-5 rounded-lg bg-zinc-100 px-4 shadow-sm ring-1 ring-zinc-950/10" onSubmit={handleSubmit}>
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

			<Divider className={cn("my-10", !selectedSession.isDelegateApplicationsAutoOpen && "invisible")} />
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
}: {
	applicationsOfSession: DelegationDeclaration[];
	selectedSession: Session;
}) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [softAssignedCountries, setSoftAssignedCountries] = useState([]);
	const [page, setPage] = useState(1);
	const itemsPerPage = 1;

	// Log softAssignedCountries changes
	useEffect(() => {
		console.log(softAssignedCountries);
	}, [softAssignedCountries]);

	// Function to handle soft assignment change
	const handleSoftAssignChange = (application: DelegationDeclaration, index: number, country: string) => {
		let newSoftAssignedCountries = [...softAssignedCountries];

		// Filter out previous assignment for this school and delegation
		newSoftAssignedCountries = newSoftAssignedCountries.filter(
			(softAssignedCountry) => !(softAssignedCountry.schoolId === application.schoolId && softAssignedCountry.delegationNumber === index + 1)
		);

		// Add the new assignment
		newSoftAssignedCountries.push({
			schoolId: application.schoolId,
			delegationNumber: index + 1,
			country,
		});

		setSoftAssignedCountries(newSoftAssignedCountries);
	};

	return (
		<>
			<div className="rounded-lg bg-zinc-100 px-4 ring-1 ring-zinc-950/10">
				<DescriptionList>
					<DescriptionTerm>Country</DescriptionTerm>
					<DescriptionDetails>Status</DescriptionDetails>
					{selectedSession.countriesOfSession.map((country) => {
						const selectedCountry = countries.find((c) => c.countryCode === country);
						return (
							<Fragment key={country}>
								<DescriptionTerm>
									<Text>
										{selectedCountry?.flag} {selectedCountry?.countryNameEn}
									</Text>
								</DescriptionTerm>
								<DescriptionDetails>
									{/* Future: Logic for showing the assignment status of the country (Soft Assigned, Hard Assigned, Not Assigned) */}
								</DescriptionDetails>
							</Fragment>
						);
					})}
				</DescriptionList>
			</div>

			{applicationsOfSession?.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((application) => (
				<li key={application.schoolId} className="flex flex-col gap-x-8 gap-y-6 rounded-lg bg-zinc-100 p-4 ring-1 ring-zinc-950/10 md:flex-col">
					<div className="space-y-1">
						<Link href={`/medibook/schools/${application.school.slug || application.schoolId}`}>
							<Subheading className="underline">{application.school.name}</Subheading>
						</Link>
						<DescriptionList>
							<DescriptionTerm>Application Status</DescriptionTerm>
							<DescriptionDetails>
								<Badge color="yellow">Submitted & Pending</Badge>
							</DescriptionDetails>

							<DescriptionTerm>Application Date</DescriptionTerm>
							<DescriptionDetails>
								<Text>{new Date(application.date).toLocaleString("en-GB").replace(",", " at ")}</Text>
							</DescriptionDetails>

							<DescriptionTerm>Requested Number of Delegations</DescriptionTerm>
							<DescriptionDetails>{application.numberOfGACountries}</DescriptionDetails>

							<DescriptionTerm>Country Preferences</DescriptionTerm>
							<DescriptionDetails className="flex flex-wrap gap-2">
								{application.countyPreferences.map((country) => {
									const selectedCountry = countries.find((c) => c.countryCode === country);
									return (
										<Badge color={softAssignedCountries.some((c) => c.country === country) ? "yellow" : "red"} key={country}>
											{selectedCountry?.flag} {selectedCountry?.countryNameEn}
										</Badge>
									);
								})}
							</DescriptionDetails>
						</DescriptionList>
					</div>

					<div className="my-auto grid grid-cols-1 gap-2">
						{arrayFromNumber(application.numberOfGACountries).map((_, index) => (
							<Listbox
								key={index}
								value={
									softAssignedCountries.find(
										(softAssignedCountry) =>
											softAssignedCountry.schoolId === application.schoolId && softAssignedCountry.delegationNumber === index + 1
									)?.country || null
								}
								onChange={(val) => handleSoftAssignChange(application, index, val)}>
								<ListboxOption value="NOTGRANTED">Don't Grant Delegation Request</ListboxOption>
								{selectedSession.countriesOfSession
									.filter((country) => {
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
									.map((country) => {
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
						))}
					</div>

					{/* Save and send back button */}
					<div className="col-span-2 flex w-full justify-end">
						<Button className="w-full md:w-auto" color="red">
							Save & Send Back
						</Button>
					</div>
				</li>
			))}

			{/* Pagination controls */}
			<Paginator
				control={{
					total: Math.ceil(applicationsOfSession.length / itemsPerPage),
					page,
					onChange: setPage,
				}}
			/>
		</>
	);
}
