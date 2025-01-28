import prisma from "@/prisma/client";
import { DeleteLocationModal } from "./modalDeleteLocation";
import { EditLocationModal } from "./modalEditLocation";
import { AddLocationModal } from "./modalAddLocation";

export default async function Modal(props) {
	const searchParams = await props.searchParams;
	const query = searchParams?.search || "";
	const queryObject = { where: { name: { contains: query, mode: "insensitive" } } };

	let edit, del, numberOfSchools;
	if (searchParams?.["edit-location"]) {
		edit = await prisma.location.findUnique({ where: { id: searchParams["edit-location"] } }).catch();
	}
	if (searchParams?.["delete-location"]) {
		del = await prisma.location.findUnique({ where: { id: searchParams["delete-location"] }, include: { school: true } }).catch();
		numberOfSchools = prisma.location.count(queryObject as any).catch(() => 0);
	}

	return (
		<>
			<AddLocationModal />
			<EditLocationModal edit={edit} />
			<DeleteLocationModal location={del} total={numberOfSchools} />
		</>
	);
}
