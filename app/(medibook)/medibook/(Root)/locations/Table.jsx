"use client";

import Link from "next/link";
import { Button, Spacer, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@nextui-org/react";
import prisma from "@/prisma/client";
import * as SolarIconSet from "solar-icon-set";
import { deleteLocation } from "./location.server.js";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TopBar } from "@/components/medibook/TopBar.jsx";
import { Frame } from "@/components/medibook/Frame.jsx";

export default function Addresses({ locations }) {
	console.log(locations);
	const { toast } = useToast();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	async function deleteLocationHandler(locationId) {
		setIsLoading(true);
		const res = await deleteLocation(locationId);
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant,
			});

		if (res.ok) router.refresh();
		setIsLoading(false);
	}
	return (
		<>
			<TopBar title="Locations">
				<Button as={Link} href="?add" className="my-auto ml-auto">
					Add Location
				</Button>
			</TopBar>
			<Frame>
				<Table removeWrapper isStriped isCompact className="static z-0">
					<TableHeader>
						<TableColumn>NAME</TableColumn>
						<TableColumn>ADDRESS</TableColumn>
						<TableColumn>LINKED SCHOOL</TableColumn>
						<TableColumn>ACTIONS</TableColumn>
					</TableHeader>
					<TableBody emptyContent={"No Locations Found"}>
						{locations.map((location, index) => {
							return (
								<TableRow key={location.id}>
									<TableCell>{location.name}</TableCell>
									<TableCell>{location.street + ", " + location.state + ", " + location.zipCode + ", " + location.country}</TableCell>
									<TableCell>
										{" "}
										{location.school[0] ? (
											<Link className="text-blue-500" href={`/medibook/schools?view=${location.school[0] ? location.school[0].id : ""}&return=/medibook/locations`}>
												{location.school[0].name} ↗
											</Link>
										) : (
											"No Linked School"
										)}
									</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Button isDisabled={isLoading} isLoading={isLoading} type="submit" onPress={() => deleteLocationHandler(location.id)} color="danger" isIconOnly>
												<SolarIconSet.TrashBinMinimalistic iconStyle="Outline" size={24} />
											</Button>
											<Button as={Link} href={`locations?edit=${location.id}`} isDisabled={isLoading} isLoading={isLoading} isIconOnly>
												<SolarIconSet.PenNewSquare iconStyle="Outline" size={24} />
											</Button>
											<Button as={Link} href={`locations?view=${location.id}`} isDisabled={isLoading} isLoading={isLoading} isIconOnly>
												<SolarIconSet.Eye iconStyle="Outline" size={24} />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</Frame>
		</>
	);
}
