import prisma from "@/prisma/client";
import { ModalEditCommittee } from "./modalEditCommitte";

export default async function Modals({ searchParams }) {
	let selectedCommittee = {};
	if (searchParams["edit-committee"]) {
		let prismaCommittee;
		try {
			prismaCommittee = await prisma.committee.findFirstOrThrow({
				where: {
					id: searchParams.editcommittee,
				},
			});
		} catch (e) {
			return {
				ok: false,
				message: "Failed to find committee.",
				response: null,
			};
		}
		selectedCommittee = prismaCommittee;
	}

	return (
		<>
			<ModalEditCommittee selectedCommittee={selectedCommittee} />
		</>
	);
}
