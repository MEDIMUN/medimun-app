import prisma from "@/prisma/client";
import { ModalEditDepartment } from "./modals";

export default async function Modals({ searchParams }) {
	let editDepartment = {};
	if (searchParams["edit-department"]) {
		try {
			editDepartment = await prisma.department.findFirstOrThrow({ where: { id: searchParams["edit-department"] } });
		} catch (e) {
			editDepartment = {};
		}
	}

	return <ModalEditDepartment selectedDepartment={editDepartment} />;
}
