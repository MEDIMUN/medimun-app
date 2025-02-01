import { auth } from "@/auth";
import { AddPolicyModal, DeletePolicyModal, EditPolicyModal } from "./modals";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { authorize, s } from "@/lib/authorize";

export default async function Modal(props) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	if (!isManagement) return null;
	const searchParams = await props.searchParams;

	let selectedPolicy;

	if (searchParams["edit-policy"]) {
		selectedPolicy = await prisma.policy.findFirst({ where: { id: searchParams["edit-policy"] } }).catch(notFound);
	}

	if (searchParams["delete-policy"]) {
		selectedPolicy = await prisma.policy.findFirst({ where: { id: searchParams["delete-policy"] } }).catch(notFound);
	}

	return (
		<>
			<AddPolicyModal />
			{selectedPolicy && <EditPolicyModal selectedPolicy={selectedPolicy} />}
			{selectedPolicy && <DeletePolicyModal selectedPolicy={selectedPolicy} />}
		</>
	);
}
