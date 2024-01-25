import Drawer from "./Drawer";
import prisma from "@/prisma/client";
import Table from "./Table";

export default async function Page() {
	const locations = await prisma.location.findMany({ orderBy: { name: "asc" }, include: { school: true } }).catch(() => notFound());
	return (
		<>
			<Drawer locations={locations} />
			<Table locations={locations} />
		</>
	);
}
