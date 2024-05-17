"use client";

import React, { useContext, useEffect, useState } from "react";
import { Avatar, Button, ScrollShadow, Spacer, Input, SelectSection, Tooltip, Link, ButtonGroup, ModalContent, Modal } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Select, SelectItem, Chip } from "@nextui-org/react";
import { getOrdinal } from "@/lib/get-ordinal";
import TeamAvatar from "@/nextuipro/team-avatar";
import { authorize, s } from "@/lib/authorize";
import { motion, AnimatePresence } from "framer-motion";

import MediBookLogo from "@/public/assets/branding/logos/medibook-logo-white-2.svg";

import Sidebar from "@/nextuipro/sidebar";
import { romanize } from "@/lib/romanize";
import { getSessionData } from "@/nextuipro/actions";
import { SidebarContext } from "@/app/(medibook)/providers";
import useWindowDimensions from "@/hooks/useWindowDimensions";

export default function Component({ sessions }) {
	const { data: session, status } = useSession();
	const [sessionsData, setSessionsData] = useState(sessions);
	const [selectedSession, setSelectedSession] = useState(sessions[0]?.number);
	const [selectedSessionData, setSelectedSessionData] = useState();
	let { isHidden, setIsHidden, isDark } = useContext(SidebarContext);
	const [isMobile, setIsMobile] = useState(false);
	const { width } = useWindowDimensions();

	const pathname = usePathname();
	const router = useRouter();

	const selectedSessionCommittees = selectedSessionData?.committee;
	const selectedSessionDepartments = selectedSessionData?.department;

	const committees = selectedSessionCommittees?.map((committee) => {
		return {
			key: `/medibook/sessions/${selectedSession}/committees/${committee.slug || committee.id}`,
			href: `/medibook/sessions/${selectedSession}/committees/${committee.slug || committee.id}`,
			title: committee.name,
			startContent: <TeamAvatar name={committee.shortName || " "} />,
		};
	});
	const departments = selectedSessionDepartments?.map((department) => {
		return {
			key: `/medibook/sessions/${selectedSession}/departments/${department.slug || department.id}`,
			href: `/medibook/sessions/${selectedSession}/departments/${department.slug || department.id}`,
			title: department.name,
			startContent: <TeamAvatar name={department.shortName || " "} />,
		};
	});
	const sessionItems = [
		{
			key: `/medibook/sessions/${selectedSession}/committees`,
			href: `/medibook/sessions/${selectedSession}/committees`,
			title: "Committees",
			icon: "solar:sledgehammer-outline",
		},
		{
			key: `/medibook/sessions/${selectedSession}/departments`,
			href: `/medibook/sessions/${selectedSession}/departments`,
			title: "Departments",
			icon: "solar:bag-4-outline",
		},
		{
			key: `/medibook/sessions/${selectedSession}/programme`,
			href: `/medibook/sessions/${selectedSession}/programme`,
			icon: "solar:calendar-date-outline",
			title: "Programme",
		},
		{
			key: `/medibook/sessions/${selectedSession}/participants`,
			href: `/medibook/sessions/${selectedSession}/participants`,
			icon: "solar:users-group-two-rounded-outline",
			title: "Participants",
			role: [s.management, s.delegate, s.member, s.chair, s.manager, s.schooldirector],
		},
		{
			key: `/medibook/sessions/${selectedSession}/resources`,
			href: `/medibook/sessions/${selectedSession}/resources`,
			icon: "solar:folder-2-outline",
			title: "Resources",
		},
		{
			key: `/medibook/sessions/${selectedSession}/settings`,
			href: `/medibook/sessions/${selectedSession}/settings`,
			icon: "solar:settings-outline",
			title: "Settings",
			role: [s.management],
		},
	];
	const committeesObject = !!selectedSessionCommittees?.length
		? {
				key: "committees",
				title: "Committees",
				items: committees,
		  }
		: null;
	const departmentsObject = !!selectedSessionDepartments?.length
		? {
				key: "departments",
				title: "Departments",
				items: departments,
		  }
		: null;
	const sessionObject = selectedSession
		? {
				key: "session",
				title: `Session ${selectedSession}`,
				items: sessionItems,
		  }
		: null;

	const sectionItemsWithTeams = [
		{
			key: "overview",
			items: [
				{
					key: "/medibook",
					href: "/medibook",
					icon: "solar:home-2-linear",
					title: "Home",
				},
				{
					key: "/medibook/notices",
					href: "/medibook/notices",
					icon: "solar:inbox-archive-outline",
					title: "Notices",
					endContent: (
						<Chip size="sm" variant="flat">
							3
						</Chip>
					),
				},
				{
					key: "/medibook/users",
					href: "/medibook/users",
					icon: "solar:user-outline",
					title: "Users",
					role: [s.management],
				},
				{
					key: "/medibook/schools",
					href: "/medibook/schools",
					icon: "solar:square-academic-cap-2-outline",
					title: "Schools",
					role: [s.management],
				},
				{
					key: "/medibook/locations",
					href: "/medibook/locations",
					icon: "solar:map-point-outline",
					title: "Locations",
					role: [s.management],
				},
				{
					key: "/medibook/sessions",
					href: "/medibook/sessions",
					icon: "solar:widget-outline",
					title: "Sessions",
				},
			],
		},
		sessionObject,
		committeesObject,
		departmentsObject,
	];

	useEffect(() => {
		// This function will extract the session ID from the pathname if possible
		const getSessionFromPath = () => {
			const parts = pathname.split("/");
			// Check if the URL matches the expected format for sessions
			if (parts.length >= 3 && parts[1] === "medibook" && parts[2] === "sessions") {
				return parts[3]; // This might be the session ID or undefined if it's just '/medibook/sessions'
			}
			return null;
		};

		const sessionFromPath = getSessionFromPath();
		if (sessionFromPath) setSelectedSession(sessionFromPath);
	}, [pathname]); // Depend only on pathname to avoid infinite loops

	useEffect(() => {
		// This effect handles redirection if the selectedSession state changes
		if (selectedSession) {
			let newUrl = `/medibook/sessions/${selectedSession}`;
			const parts = pathname.split("/");
			// Append additional path segments if they exist
			if (parts.length > 4) {
				const additionalPath = parts.slice(4).join("/");
				newUrl += `/${additionalPath}`;
			}
			if (pathname !== newUrl && pathname.includes("/medibook/sessions/")) {
				router.push(newUrl);
			}
		}
		handleSessionChange();
	}, [selectedSession]); // Depend only on selectedSession to avoid infinite loops

	useEffect(() => {
		if (width < 768) {
			setIsMobile(true);
		} else {
			setIsMobile(false);
		}
		console.log(isMobile);
	}, [width]);

	function handleSidebarClose() {
		if (isMobile) {
			setIsHidden(true);
		}
	}

	async function handleSessionChange() {
		const sessionData = await getSessionData(selectedSession);
		setSelectedSessionData(sessionData);
	}

	return (
		<AnimatePresence>
			{(!isHidden || !isMobile) && (
				<motion.div
					radius="none"
					exit={{
						x: -288,
						transition: {
							duration: 0.2,
							ease: "easeOut",
						},
					}}
					animate={{
						x: 0,
						transition: {
							duration: 0.3,
							ease: "easeOut",
						},
					}}
					initial={{
						x: -288,
					}}
					className="absolute left-0 z-[200] max-h-screen min-w-[288px] max-w-[288px] overflow-y-scroll bg-content1 p-6 shadow-sm shadow-content1 md:static md:rounded-r-2xl md:bg-content1/60"
					isOpen={!isHidden || !isMobile}>
					<div className="flex items-center gap-2 px-2">
						<Image alt="MediBook Logo" height={18} className="hover:grayscale-0 light:grayscale" src={MediBookLogo} />
						<Button className="static ml-auto flex justify-center align-middle md:hidden" onPress={handleSidebarClose} radius="full" size="sm" isIconOnly>
							<Icon icon="solar:alt-arrow-left-outline" width={20} className="text-white" />
						</Button>
					</div>
					<Spacer y={4} />
					<div className="flex flex-col gap-4 ">
						<Select
							disallowEmptySelection
							disableSelectorIconRotation
							aria-label="Select workspace"
							className="px-1"
							classNames={{
								trigger: "min-h-14 bg-transparent border-small border-default-200 dark:border-default-100 data-[hover=true]:border-default-500 dark:data-[hover=true]:border-default-200 data-[hover=true]:bg-transparent",
							}}
							onChange={(e) => setSelectedSession(e.target.value)}
							selectedKeys={[selectedSession]}
							items={sessionsData}
							listboxProps={{
								bottomContent: (
									<div className="flex gap-1">
										<Button as={Link} href="/medibook/sessions" className="w-full bg-default-100 text-center text-foreground" size="sm" onPress={() => console.log("on create workspace")}>
											All Sessions
										</Button>
										{status === "authenticated" && authorize(session, [s.admins, s.sd]) && (
											<Button isIconOnly as={Link} href="/medibook/sessions?add" className="bg-default-100 text-center text-foreground" size="sm" onPress={() => console.log("on create workspace")}>
												+
											</Button>
										)}
									</div>
								),
							}}
							placeholder="Select session"
							renderValue={(items) => {
								return items.map((item) => {
									return (
										<div className="flex gap-2">
											<div className="relative flex h-10 w-10 flex-none rounded-full border-small border-default-300 bg-gradient-to-r from-primary to-red-500 text-white">
												<p className="font-[montserrat  my-auto w-full text-center text-lg font-light">{romanize(item?.data?.number)}</p>
											</div>
											<div key={item.key} className="my-auto flex flex-col gap-y-0.5 truncate">
												<span className="text-tiny leading-4">
													{item?.data?.number}
													<sup>{getOrdinal(item?.data?.number)}</sup> Annual Session
												</span>
												<Tooltip content={item?.data?.theme}>
													<span className="truncate text-tiny text-default-400">{item?.data?.theme}</span>
												</Tooltip>
											</div>
										</div>
									);
								});
							}}
							selectorIcon={<Icon color="hsl(var(--nextui-default-500))" icon="lucide:chevrons-up-down" />}>
							{(session) => {
								return (
									<SelectItem hideSelectedIcon key={session.number} aria-label={session.number} textValue={session.number}>
										<div className="flex flex-row items-center justify-between gap-1">
											<div className="flex max-w-[130px] flex-col overflow-hidden">
												<p className="truncate">
													{session.number}
													<sup className="text-[0.5px]">{getOrdinal(session.number)}</sup> Annual Session
												</p>
												<p className="truncate text-xs">{session.theme}</p>
											</div>
											<div className="flex h-6 w-6 items-center justify-center rounded-full border-small border-default-300 bg-gradient-to-r from-green-300 via-blue-500 to-purple-600">{romanize(session.number)}</div>
										</div>
									</SelectItem>
								);
							}}
						</Select>
					</div>
					<ScrollShadow className="h-fulls max-h-full py-6">
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
				</motion.div>
			)}
		</AnimatePresence>
	);
}
