import prisma from "@/prisma/client";
import { TitleBar, e as s } from "@/components/medibook/TitleBar";
import { getOrdinal } from "@/lib/get-ordinal";
import Drawer from "./Drawer";
import { notFound } from "next/navigation";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Accordion, AccordionItem } from "@nextui-org/react";

export default async function Page({ params }) {
	const committee = await getData(params);
	const session = getServerSession(authOptions);
	if (!committee) return notFound();
	return (
		<>
			<Drawer committee={committee} params={params} />
			<TitleBar title="Topic Details" button1text="Edit Topics" button1roles={[s.management]} button1show={session?.user?.roles?.some((role) => role.name === "Manager" && role.committeeId === committee.id)} button1href={"/medibook/sessions/" + params.sessionNumber + "/committees/" + (committee.slug || committee.id) + "/topics" + "?edit"} />
			<div className="mx-auto grid w-full max-w-[1200px] gap-2 p-4 md:flex-row"></div>
		</>
	);
}

async function getData(params) {
	let committee;
	try {
		committee = await prisma.committee.findFirst({
			where: {
				OR: [{ slug: params.committeeId }, { id: params.committeeId }],
				session: {
					number: params.sessionNumber,
				},
			},
			include: {
				session: {
					select: {
						number: true,
					},
				},
			},
		});
	} catch (e) {}
	if (!committee) return notFound();
	return committee;
}
