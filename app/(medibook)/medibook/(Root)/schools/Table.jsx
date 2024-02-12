"use client";

import Link from "next/link";
import { Button, Spacer, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@nextui-org/react";
import prisma from "@/prisma/client";
import * as SolarIconSet from "solar-icon-set";
import { deleteSchool } from "./school.server.js";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TopBar } from "@/components/medibook/TopBar.jsx";
import { Frame } from "@/components/medibook/Frame.jsx";

export default function Addresses({ schools }) {
	const { toast } = useToast();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	async function deleteSchoolHandler(schoolId) {
		setIsLoading(true);
		const res = await deleteSchool(schoolId);
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
			<TopBar title="Schools">
				<Button as={Link} href="?add" className="my-auto ml-auto">
					Add School
				</Button>
			</TopBar>
			<Frame>
				<Table removeWrapper isStriped isCompact className="static z-0">
					<TableHeader>
						<TableColumn>NAME</TableColumn>
						<TableColumn>SCHOOL DIRECTOR</TableColumn>
						<TableColumn>LINKED LOCATION</TableColumn>
						<TableColumn>ACTIONS</TableColumn>
					</TableHeader>
					<TableBody emptyContent={"No Schools Found"}>
						{schools.map((school, index) => {
							return (
								<TableRow key={school.id}>
									<TableCell>{school.name}</TableCell>
									<TableCell>{}</TableCell>
									<TableCell>
										{school.location ? (
											<Link className="text-blue-500" href={`/medibook/locations?view=${school.location ? school.location.id : ""}&return=/medibook/schools`}>
												{school.location.name} ↗
											</Link>
										) : (
											"No Linked Location"
										)}
									</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Button isDisabled={isLoading} isLoading={isLoading} type="submit" onPress={() => deleteSchoolHandler(school.id)} color="danger" isIconOnly>
												<SolarIconSet.TrashBinMinimalistic iconStyle="Outline" size={24} />
											</Button>
											<Button as={Link} href={`schools?edit=${school.id}`} isDisabled={isLoading} isLoading={isLoading} isIconOnly>
												<SolarIconSet.PenNewSquare iconStyle="Outline" size={24} />
											</Button>
											<Button as={Link} href={`schools?view=${school.id}`} isDisabled={isLoading} isLoading={isLoading} isIconOnly>
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
