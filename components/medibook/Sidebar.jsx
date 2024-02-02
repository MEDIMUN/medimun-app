"use client";

import Logo from "./Logo";
import { User, Button, Select, SelectSection, ScrollShadow, SelectItem, Skeleton, Chip } from "@nextui-org/react";
import Image from "next/image";
import MediBookLogo from "@public/assets/branding/logos/medibook-logo-white-2.svg";
import MediBookBadge from "@public/assets/branding/badges/medibook-badge-white-1.svg";
import { useSession } from "next-auth/react";
import * as SolarIconSet from "solar-icon-set";
import Link from "next/link";
import { useState, useEffect, createContext, useContext } from "react";
import { getOrdinal } from "@/lib/get-ordinal";
import { usePathname } from "next/navigation";
import { getAllSessions } from "./get-sessions.server";
import { signOut } from "next-auth/react";
import { SidebarContext } from "@/app/(medibook)/providers.jsx";
import { authorize, s } from "@/lib/authorize";

export default function Sidebar() {
	let { isHidden, setIsHidden } = useContext(SidebarContext);
	const { data: session, status } = useSession();
	const ButtonStyle = "w-full text-left justify-start bg-transparent hover:bg-gray-300 p-4 py-2";
	const ButtonSize = "md";
	const [selectedSession, setSelectedSession] = useState("");
	const [sessions, setSessions] = useState([]);
	const currentPath = usePathname();
	useEffect(() => {
		if (currentPath.startsWith("/medibook/sessions/")) {
			const sessionNumber = currentPath.split("/")[3];
			if (sessionNumber != selectedSession) setSelectedSession(sessionNumber);
		}
	}, [currentPath]);
	useEffect(() => {
		async function getSessions() {
			const sessions = await getAllSessions();
			setSessions(sessions);
		}
		getSessions();
	}, []);

	if (status == "authenticated")
		return (
			<>
				<nav className={`-bg-gradient-to-tr fixed z-[100] flex max-h-[100svh] min-h-screen w-64 flex-col overflow-hidden border-r-1  bg-gray-200 duration-200 ${isHidden ? "-translate-x-[256px]" : ""}`}>
					<div className="flex flex-col gap-6 p-6">
						<div className="flex">
							<Image alt="MediBook Logo" className="fill-black grayscale hover:filter-none" src={MediBookLogo} height={16} />
							{!isHidden && (
								<Button className="absolute left-[256px] top-0 ml-auto -translate-x-[100%] rounded-r-none rounded-t-none bg-white md:hidden" isIconOnly onPress={() => setIsHidden(true)}>
									<SolarIconSet.CloseCircle color="var(--medired)" iconStyle="Outline" size={28} />
								</Button>
							)}
						</div>
						<Select items={sessions} selectedKeys={[selectedSession]} onChange={(e) => setSelectedSession(e.target.value)} label="Select a session" size="sm" className="max-w-xs">
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
					<ScrollShadow size={150} className="flex flex-col gap-6 overflow-y-scroll px-6">
						<div className="w-full">
							<p className="mb-1 ml-2 text-xs text-slate-800">General</p>
							<Button as={Link} href="/medibook" className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.Home2 iconStyle="Outline" size={24} />}>
								Home
							</Button>
							<Button as={Link} href="/medibook/notices" className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.InboxArchive iconStyle="Outline" size={24} />}>
								Notices
							</Button>
							{authorize(session, [s.management]) && (
								<Button as={Link} href="/medibook/schools" className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.SquareAcademicCap2 iconStyle="Outline" size={24} />}>
									Schools
								</Button>
							)}
							{authorize(session, [s.management]) && (
								<Button as={Link} href="/medibook/users" className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.User iconStyle="Outline" size={24} />}>
									Users
								</Button>
							)}
							{authorize(session, [s.management]) && (
								<Button as={Link} href="/medibook/locations" className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.MapPoint iconStyle="Outline" size={24} />}>
									Locations
								</Button>
							)}
							<Button as={Link} href="/medibook/sessions" className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.Calendar iconStyle="Outline" size={24} />}>
								All Sessions
							</Button>
						</div>
						{selectedSession && typeof selectedSession == "string" && (
							<div className="w-full">
								<p className="mb-1 ml-2 text-xs text-slate-800">
									{selectedSession}
									<sup>{getOrdinal(selectedSession)}</sup> Annual Session
								</p>
								<Button as={Link} href={`/medibook/sessions/${selectedSession}`} className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.Home2 iconStyle="Outline" size={24} />}>
									Overview
								</Button>
								<Button as={Link} href={`/medibook/sessions/${selectedSession}/announcements`} className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.InboxArchive iconStyle="Outline" size={24} />}>
									Announcements
								</Button>
								<Button as={Link} href={`/medibook/sessions/${selectedSession}/days`} className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.Calendar iconStyle="Outline" size={24} />}>
									Days
								</Button>
								<Button as={Link} href={`/medibook/sessions/${selectedSession}/users`} className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.User iconStyle="Outline" size={24} />}>
									Users
								</Button>
								<Button as={Link} href={`/medibook/sessions/${selectedSession}/committees`} className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.UsersGroupTwoRounded iconStyle="Outline" size={24} />}>
									Committees
								</Button>
								<Button as={Link} href={`/medibook/sessions/${selectedSession}/departments`} className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.User iconStyle="Outline" size={24} />}>
									Departments
								</Button>
								<Button as={Link} href={`/medibook/sessions/${selectedSession}/resources`} className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.FolderWithFiles iconStyle="Outline" size={24} />}>
									Resources
								</Button>
							</div>
						)}
						<div className="w-full">
							<p className="mb-1 ml-2 text-xs text-slate-800">{}</p>
							<Button as={Link} href={`/medibook/sessions/${selectedSession}`} className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.Home2 iconStyle="Outline" size={24} />}>
								Overview
							</Button>
							<Button as={Link} href={`/medibook/sessions/${selectedSession}/announcements`} className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.InboxArchive iconStyle="Outline" size={24} />}>
								Announcements
							</Button>
							<Button as={Link} href={`/medibook/sessions/${selectedSession}/days`} className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.Calendar iconStyle="Outline" size={24} />}>
								Days
							</Button>
							<Button as={Link} href="/medibook/users" className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.User iconStyle="Outline" size={24} />}>
								Users
							</Button>
							<Button as={Link} href={`/medibook/sessions/${selectedSession}/resources`} className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.MapPoint iconStyle="Outline" size={24} />}>
								Resources
							</Button>
						</div>
					</ScrollShadow>
					<div className="mt-auto flex max-h-[100svh] flex-col p-6">
						<Button as={Link} href="/medibook/account" className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.UserCircle iconStyle="Outline" size={24} />}>
							Account
						</Button>
						<Button onPress={signOut} className={ButtonStyle} size={ButtonSize} startContent={<SolarIconSet.MinusCircle iconStyle="Outline" size={24} />}>
							Sign Out
						</Button>
						<div className="mt-4 px-4">
							{status == "authenticated" ? (
								<User
									className="mr-auto"
									name={session?.user?.officialName + " " + session?.user?.officialSurname}
									description={session?.currentRoleNames[0] || (session?.pastRoleNames?.length == 0 ? "Applicant" : "Alumni")}
									avatarProps={{
										isBordered: true,
										showFallback: true,
										color: "danger",
										size: "sm",
										name: session?.user?.officialName[0] + session?.user?.officialSurname[0],
										src: "/api/users/" + session?.user?.id + "/avatar",
									}}
								/>
							) : (
								<Skeleton className="rounded-lg">
									<div className="h-10 rounded-lg bg-default-300"></div>
								</Skeleton>
							)}
						</div>
					</div>
				</nav>
				<div className={`h-full w-0 duration-200 ${isHidden ? "w-0" : "md:w-[256px] md:min-w-[256px]"}`} />
			</>
		);
}
