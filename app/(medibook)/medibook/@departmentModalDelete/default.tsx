import prisma from "@/prisma/client";
import { ModalDeleteDepartment } from "./modals";

export default async function Modals({ searchParams }) {
	let editDepartment = {};
	if (searchParams["delete-department"]) {
		try {
			editDepartment = await prisma.department.findFirstOrThrow({ where: { id: searchParams["delete-department"] } });
		} catch (e) {
			editDepartment = {};
		}
	}

	return <ModalDeleteDepartment selectedDepartment={editDepartment} />;
}
