import DelegatesTable from "./DelegatesTable";
import prisma from "@/prisma/client";
import { countries } from "@/data/countries";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Autocomplete, Avatar, AutocompleteSection, AutocompleteItem } from "@nextui-org/react";

async function getDelegates(params) {
	return await prisma.delegate.findMany({
		where: {
			OR: [
				{
					committee: {
						delegate: {
							some: {
								committee: {
									id: params.committeeId,
								},
							},
						},
					},
				},
				{
					committee: {
						delegate: {
							some: {
								committee: {
									slug: params.committeeId,
									session: {
										number: params.sessionNumber,
									},
								},
							},
						},
					},
				},
			],
		},
		include: {
			user: {
				select: {
					officialName: true,
					officialSurname: true,
					email: true,
					displayName: true,
					id: true,
				},
			},
		},
	});
}

async function getChairs(params) {
	return await prisma.chair.findMany({
		where: {
			OR: [
				{
					committee: {
						chair: {
							some: {
								committee: {
									id: params.committeeId,
								},
							},
						},
					},
				},
				{
					committee: {
						chair: {
							some: {
								committee: {
									slug: params.committeeId,
									session: {
										number: params.sessionNumber,
									},
								},
							},
						},
					},
				},
			],
		},
		include: {
			user: {
				select: {
					officialName: true,
					officialSurname: true,
					displayName: true,
					id: true,
					email: true,
				},
			},
		},
	});
}

export default async function Page({ params }) {
	let delegates = getDelegates(params);
	let chairs = getChairs(params);
	[delegates, chairs] = await Promise.all([delegates, chairs]);
	return (
		<>
			<div className="mx-auto max-w-[1248px] p-6">
				<DelegatesTable params={params} delegates={delegates} chairs={chairs} />
			</div>
		</>
	);
}
