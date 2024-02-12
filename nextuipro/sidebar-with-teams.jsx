"use client";

import React from "react";
import { Avatar, Button, ScrollShadow, Spacer, Input } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Select, SelectItem, Chip } from "@nextui-org/react";
import { getOrdinal } from "@/lib/get-ordinal";
import { sectionItems } from "./sidebar-items";
import TeamAvatar from "@/nextuipro/team-avatar";

import MediBookLogo from "@public/assets/branding/logos/medibook-logo-white-2.svg";

import Sidebar from "./sidebar";

export default function Component({ isDark, selectedSession, sessions, setSelectedSession }) {
	const { data: session, status } = useSession();
	const selectedSessionData = sessions.find((session) => session.number == selectedSession);
	const selectedSessionCommittees = selectedSessionData?.committee;
	const selectedSessionDepartments = selectedSessionData?.department;
	const committees = selectedSessionCommittees?.map((committee) => {
		return {
			key: committee.key,
			href: `/medibook/sessions/${selectedSession}/committees/${committee.slug || committee.id}`,
			title: committee.name,
			startContent: <TeamAvatar name={committee.shortName || " "} />,
		};
	});
	const departments = selectedSessionDepartments?.map((department) => {
		return {
			key: department.key,
			href: `/medibook/sessions/${selectedSession}/departments/${department.slug || department.id}`,
			title: department.name,
			startContent: <TeamAvatar name={department.shortName || " "} />,
		};
	});

	const sectionItemsWithTeams = [
		...sectionItems,
		{
			key: "committees",
			title: "Committees",
			items: committees,
		},
		{
			key: "departments",
			title: "Departments",
			items: departments,
		},
	];

	return (
		<div className={`absolute z-[100] h-[100dvh] max-h-[100dvh] ${isDark ? "bg-black" : "bg-white"}`}>
			<div className="relative flex h-full w-72 flex-1 flex-col border-r-small border-r-divider p-6">
				<div className="flex items-center gap-2 px-2">
					<Image alt="MediBook Logo" height={18} className="hover:grayscale-0 light:grayscale" src={MediBookLogo} />
				</div>
				<Spacer y={6} />
				<div className="flex flex-col gap-4">
					{status == "authenticated" && (
						<div className="flex items-center gap-3 px-2">
							<Avatar isBordered size="sm" src={`/api/users/${session?.user.id}/avatar`} />
							<div className="flex flex-col">
								<p className="text-small font-medium text-default-600">{session?.user.officialName + " " + session?.user.officialSurname}</p>
								<p className="text-tiny text-default-400">{session?.currentRoles[0]?.name || "Applicant"}</p>
							</div>
						</div>
					)}
					<Select fullWidth aria-label="search" className="px-1" labelPlacement="outside" placeholder="Session" items={sessions} selectedKeys={[selectedSession]} onChange={(e) => setSelectedSession(e.target.value)} startContent={<Icon className="text-default-500  [&>g]:stroke-[2px]" icon="solar:magnifer-linear" width={18} />}>
						{(session) => {
							return (
								<SelectItem textValue={session.number} key={session.number} endContent={session.isCurrent && <Chip>Current</Chip>} value={session.number}>
									{session.number}
									<sup>{getOrdinal(session.number)}</sup> Annual Session
								</SelectItem>
							);
						}}
					</Select>
				</div>
				<ScrollShadow className="-mr-6 h-full max-h-full py-6">
					<Sidebar defaultSelectedKey={"home"} committees={committees} departments={departments} items={sectionItemsWithTeams} />
				</ScrollShadow>
				<Spacer y={6} />
				<div className="mt-auto flex flex-col">
					<Button fullWidth className="justify-start text-default-500 data-[hover=true]:text-foreground" startContent={<Icon className="text-default-500" icon="solar:info-circle-line-duotone" width={24} />} variant="light">
						Help & Information
					</Button>
					<Button onPress={signOut} className="justify-start text-default-500 data-[hover=true]:text-foreground" startContent={<Icon className="rotate-180 text-default-500" icon="solar:minus-circle-line-duotone" width={24} />} variant="light">
						Log Out
					</Button>
				</div>
			</div>
		</div>
	);
}
