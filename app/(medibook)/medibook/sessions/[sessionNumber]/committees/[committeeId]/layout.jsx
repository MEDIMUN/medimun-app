import SubMenu from "@components/medibook/SubMenu";
import { TopBar } from "@/components/medibook/TopBar";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { getOrdinal } from "@/lib/get-ordinal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authorize, s } from "@/lib/authorize";
import { Button, Link, ScrollShadow, Tabs, Tab, Chip, AvatarGroup, Avatar, Tooltip, Divider, Icon } from "@nextui-org/react";
import Drawer from "./Drawer";
import Navbar from "./Navbar";

export default async function Layout({ params, children }) {
	const { sessionNumber, committeeId } = params;
	let committees = prisma.committee.findMany({
		where: {
			OR: [
				{
					session: {
						number: sessionNumber,
					},
					id: committeeId,
				},
				{
					session: {
						number: sessionNumber,
					},
					slug: committeeId,
				},
			],
		},
		include: {
			session: true,
		},
	});
	let session = getServerSession(authOptions);
	[session, committees] = await Promise.all([session, committees]);
	if (!committees.length) notFound();
	const selectedCommittee = committees[0];
	const committeeTypeMap = {
		GENERALASSEMBLY: "General Assembly",
		SPECIALCOMMITTEE: "Special Committee",
		SECURITYCOUNCIL: "Security Council",
		ECOSOC: "Economic and Social Council",
		CRISIS: "Crisis",
		OTHER: "Other",
	};
	const menuItems = [
		{
			title: "About",
			href: `/medibook/sessions/${sessionNumber}/committees/${committeeId}`,
		},
		{
			title: "Announcements",
			href: `/medibook/sessions/${sessionNumber}/committees/${committeeId}/announcements`,
		},
		{
			title: "Delegates",
			href: `/medibook/sessions/${sessionNumber}/committees/${committeeId}/delegates`,
		},
		{
			title: "Topics",
			href: `/medibook/sessions/${sessionNumber}/committees/${committeeId}/topics`,
		},
		{
			title: "Resolutions",
			href: `/medibook/sessions/${sessionNumber}/committees/${committeeId}/resolutions`,
		},
		{
			title: "Documents",
			href: `/medibook/sessions/${sessionNumber}/committees/${committeeId}/documents`,
		},
	];

	return (
		<>
			<Drawer committee={selectedCommittee} params={params} />
			<TopBar
				title={selectedCommittee.name}
				description={
					<>
						{committeeTypeMap[selectedCommittee.type]} in the {selectedCommittee.session.number}
						<sup>{getOrdinal(selectedCommittee.session.number)}</sup> Annual Session
					</>
				}>
				{authorize(session, [s.management]) && (
					<Button as={Link} href={`?edit`}>
						Edit Committee
					</Button>
				)}
			</TopBar>
			<Navbar params={params} />
			{/* 			<SubMenu menuItems={menuItems} />
			 */}{" "}
			{children}
		</>
	);
}
