import prisma from "@/prisma/client";
import { ModalCreateCommittee, ModalDeleteCommittee, ModalEditCommittee } from "./modals";

export default async function Modals({ searchParams }) {
	let editCommittee = {};
	if (searchParams["edit-committee"]) {
		try {
			editCommittee = await prisma.committee.findFirstOrThrow({ where: { id: searchParams["edit-committee"] } });
		} catch (e) {
			editCommittee = {};
		}
	}

	if (searchParams["delete-committee"]) {
		try {
			editCommittee = await prisma.committee.findFirstOrThrow({ where: { id: searchParams["delete-committee"] } });
		} catch (e) {
			editCommittee = {};
		}
	}

	return (
		<>
			<ModalCreateCommittee />
			<ModalDeleteCommittee selectedCommittee={editCommittee} />
			<ModalEditCommittee selectedCommittee={editCommittee} />
		</>
	);
}
