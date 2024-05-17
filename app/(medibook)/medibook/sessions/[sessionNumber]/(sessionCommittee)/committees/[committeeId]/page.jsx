import prisma from "@/prisma/client";
import { getOrdinal } from "@/lib/get-ordinal";
import { notFound } from "next/navigation";
import EditModal from "./modals";

export default async function Page({ params, searchParams }) {
	const committee = await prisma.committee
		.findFirstOrThrow({
			where: {
				OR: [{ slug: params.committeeId }, { id: params.committeeId }],
				session: {
					number: params.sessionNumber,
				},
			},
			include: {
				session: {
					select: {
						number: true,
					},
				},
			},
		})
		.catch(notFound);

	let selectedCommittee = null;

	if (searchParams.edit) {
		selectedCommittee = await prisma.committee
			.findFirst({
				where: {
					id: searchParams.edit,
				},
			})
			.catch(notFound);
	}

	return (
		<>
			<EditModal selectedCommittee={selectedCommittee} />
			<div className="mx-auto grid w-full max-w-[1200px] gap-2 p-4 md:flex-row">
				<p>{committee.description}</p>
			</div>
		</>
	);
}
