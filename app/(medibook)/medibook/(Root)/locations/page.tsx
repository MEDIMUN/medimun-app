import { AddLocationModal } from "./modals";
import prisma from "@/prisma/client";
import Table from "./Table";
import { notFound } from "next/navigation";

export default async function Page() {
	const locations = await prisma.location.findMany({ orderBy: { name: "asc" }, include: { school: true } }).catch(notFound);
	return (
		<>
			<AddLocationModal locations={locations} />
			<Table locations={locations} />
		</>
	);
}
