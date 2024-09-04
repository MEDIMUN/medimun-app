import prisma from "@/prisma/client";
import { AddExtraCountryModal, EditExtraCountryModal } from "./modals";

export default async function Modals({ params, searchParams }) {
	let selectedCommittee, selectedExtraCountry;

	if (searchParams["edit-extra-country"]) {
		selectedCommittee = await prisma.committee.findFirstOrThrow({
			where: {
				OR: [
					{ id: params.committeeId, session: { number: params.sessionNumber } },
					{ slug: params.committeeId, session: { number: params.sessionNumber } },
				],
			},
		});

		selectedExtraCountry = await prisma.extraCountry.findFirst({
			where: {
				committeeId: selectedCommittee.id,
				id: searchParams["edit-extra-country"],
			},
		});

		if (!selectedCommittee || !selectedExtraCountry) {
			selectedCommittee = null;
			selectedExtraCountry = null;
		}
	}

	return (
		<>
			<AddExtraCountryModal /> <EditExtraCountryModal selectedCommittee={selectedCommittee} selectedExtraCountry={selectedExtraCountry} />
		</>
	);
}
