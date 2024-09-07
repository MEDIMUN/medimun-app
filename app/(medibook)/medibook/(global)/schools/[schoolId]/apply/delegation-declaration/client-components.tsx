"use client";

import { Button } from "@/components/button";
import { Divider } from "@/components/divider";
import { Subheading } from "@/components/heading";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import { Text } from "@/components/text";
import { arrayFromNumber } from "@/lib/arrayFromNumber";
import { getOrdinal } from "@/lib/ordinal";
import { useEffect, useState } from "react";
import { submitDelegationDeclaration } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SelectCountriesSection({ selectedSchool, filteredCountries, selectedSession, numberOfGACommittees }) {
	const [selectedArray, setSelectedArray] = useState(arrayFromNumber(15).map(() => ""));
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
						{arrayFromNumber(selectedSession.maxNumberOfGeneralAssemblyDelegationsPerSchool).map((number) => (
							<ListboxOption key={number + Math.random()} value={number}>
								<ListboxLabel>{number} Delegation</ListboxLabel>
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
						Select 15 countries in order of preference to be assigned to your delegations. Countries are assigned in a first come first serve basis.
					</Text>
				</div>
				<div className="my-auto grid grid-cols-1 gap-2">
					{arrayFromNumber(15).map((number) => (
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
						setSelectedArray(arrayFromNumber(15).map(() => ""));
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
