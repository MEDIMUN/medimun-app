import React from "react";
import { AddSchoolModal, DeleteSchoolModal, EditSchoolModal } from "./modals";
/* @ts-ignore */
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";

export default async function Modal({ searchParams }) {
	const query = searchParams?.search || "";
	const queryObject = { where: { name: { contains: query, mode: "insensitive" } } };

	let edit, del, numberOfSchools, locations;
	if (searchParams["edit-school"]) {
		edit = await prisma.school
			.findFirst({ where: { id: searchParams["edit-school"] }, include: { location: true }, orderBy: { name: "asc" } })
			.catch(notFound);
		locations = await prisma.location.findMany({ select: { name: true, id: true } }).catch(notFound);
	}
	if (searchParams["delete-school"]) {
		del = await prisma.school.findUnique({ where: { id: searchParams["delete-school"] }, include: { location: true } }).catch();
		numberOfSchools = prisma.school.count(queryObject as any).catch(() => 0);
	}

	return (
		<>
			<AddSchoolModal />
			<EditSchoolModal locations={locations} edit={edit} />
			<DeleteSchoolModal school={del} total={undefined} />
		</>
	);
}
