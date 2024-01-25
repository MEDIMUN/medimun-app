"use client";

import { Table, TableHeader, TableBody, Button, User, TableColumn, TableRow, TableCell, Autocomplete, AutocompleteItem, Avatar } from "@nextui-org/react";
import { countries } from "@/data/countries";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateDelegateCountry } from "./update-country.server";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function DelegatesTable({ delegates, chairs, params }) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const { toast } = useToast();
	console.log(params);

	const [assignedCountries, setAssignedCountries] = useState(
		delegates.map((delegate) => ({
			id: [delegate.id],
			country: delegate.country,
		}))
	);

	async function handleCountryChange(country, delegate) {
		setIsLoading(true);
		const res = await updateDelegateCountry(delegate, country);
		if (res?.ok) {
			setAssignedCountries(
				assignedCountries.map((assignedCountry) => {
					if (assignedCountry.id == delegate) {
						return {
							id: delegate,
							country: country,
						};
					} else {
						return assignedCountry;
					}
				})
			);
		}
		toast({
			title: res?.title,
			description: res?.description,
			variant: res?.variant,
		});
		setIsLoading(false);
	}

	useEffect(() => {}, [assignedCountries]);
	return (
		<div className="max-w- overflow-x-scroll">
			<Table className="min-w-max" removeWrapper aria-label="Example static collection table">
				<TableHeader>
					<TableColumn>OFFICIAL NAME & SURNAME</TableColumn>
					<TableColumn>PREFERRED NAME</TableColumn>
					<TableColumn>EMAIL</TableColumn>
					<TableColumn>SCHOOL</TableColumn>
					<TableColumn>DELEGATION COUNTRY</TableColumn>
					<TableColumn>ACTIONS</TableColumn>
				</TableHeader>
				<TableBody>
					{delegates.map((delegate) => {
						return (
							<TableRow key={delegate.id}>
								<TableCell>
									<User name={delegate.user.officialName + " " + delegate.user.officialSurname} avatarProps={{ src: "/" }}></User>
								</TableCell>
								<TableCell>{delegate.user.displayName}</TableCell>
								<TableCell>{delegate.user.email}</TableCell>
								<TableCell>{delegate.school}</TableCell>

								<TableCell textValue={delegate.country}>
									<Autocomplete isLoading={isLoading} isDisabled={isLoading} aria-label="a" onSelectionChange={(e) => handleCountryChange(e, delegate.id)} selectedKey={assignedCountries.filter((c) => c.id == delegate.id)[0].country} items={countries} size="xs" className="max-w-xs">
										{(country) => {
											return (
												<AutocompleteItem value={country.countryNameEn} key={country.countryCode} startContent={<Avatar showFallback name={country.flag} alt={country.flag} className="h-6 w-6" src={"https://flagcdn.com/" + country.countryCode.toLowerCase() + ".svg"} />}>
													{country.countryNameEn}
												</AutocompleteItem>
											);
										}}
									</Autocomplete>
								</TableCell>
								<TableCell className="grid grid-cols-2 gap-2">
									<Button as={Link} href={`/medibook/users/${delegate.user.id}`} size="small">
										View Profile
									</Button>
									<Button as={Link} href={`/medibook/users/${delegate.user.id}?edit&saveurl=/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}/delegates`} size="small">
										Edit User
									</Button>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
