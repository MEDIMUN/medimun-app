import EditUserModal from "./EditUserModal";
import prisma from "@/prisma/client";
import Table from "./Table";
import { notFound } from "next/navigation";

export default async function Page() {
	let schools = prisma.school.findMany({ orderBy: { name: "asc" }, include: { location: true } }).catch(() => notFound());
	let locations = prisma.location.findMany({ orderBy: { name: "asc" }, include: { school: true } }).catch(() => notFound());
	[schools, locations] = await Promise.all([schools, locations]);
	return (
		<>
			<EditUserModal locations={locations} schools={schools} />
			<Table schools={schools} />
		</>
	);
}
