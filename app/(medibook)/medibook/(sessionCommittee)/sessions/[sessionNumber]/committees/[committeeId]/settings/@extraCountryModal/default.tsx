import prisma from "@/prisma/client";
import { AddExtraCountryModal, EditExtraCountryModal } from "./modals";

export default async function Modals(props) {
    const searchParams = await props.searchParams;
    const params = await props.params;
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
