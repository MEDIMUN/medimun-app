import prisma from "@/prisma/client";
import { getOrdinal } from "@/lib/get-ordinal";

export default async function Page({ params }) {
	const department = await getData(params);
	return <></>;
}

async function getData(params) {
	let department;
	try {
		department = await prisma.department.findFirst({
			where: {
				OR: [{ slug: params.departmentId }, { id: params.departmentId }],
				session: {
					number: params.sessionNumber,
				},
			},
			select: {
				name: true,
				session: {
					select: {
						number: true,
					},
				},
			},
		});
	} catch (e) {}
	return department;
}
