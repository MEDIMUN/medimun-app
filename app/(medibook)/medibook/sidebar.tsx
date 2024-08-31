"use client";

import { Avatar } from "@/components/avatar";
import { Avatar as NextUIAvatar } from "@nextui-org/avatar";
import { Badge } from "@/components/badge";
import { Dropdown, DropdownButton, DropdownDescription, DropdownDivider, DropdownItem, DropdownLabel, DropdownMenu } from "@/components/dropdown";
import Icon from "@/components/icon";
import {
	Sidebar as SidebarComponent,
	SidebarBody,
	SidebarFooter,
	SidebarHeader,
	SidebarHeading,
	SidebarItem,
	SidebarLabel,
	SidebarSection,
	SidebarSpacer,
} from "@/components/sidebar";
import { authorize, s } from "@/lib/authorize";
import { cn } from "@/lib/cn";
import { romanize } from "@/lib/romanize";
import { getSessionData } from "./actions";
import {
	ArrowRightStartOnRectangleIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	Cog8ToothIcon,
	LightBulbIcon,
	PlusIcon,
	ShieldCheckIcon,
	SparklesIcon,
	UserCircleIcon,
} from "@heroicons/react/16/solid";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { getMoreSessions } from "./actions";
import MediBookLogo from "@/public/assets/branding/logos/medibook-logo-white-2.svg";
import Image from "next/image";
import Link from "next/link";

export function AccountDropdownMenu({ anchor }: { anchor: "top start" | "bottom end" }) {
	return (
		<DropdownMenu className="min-w-64" anchor={anchor}>
			<DropdownItem href="/medibook/account">
				<UserCircleIcon />
				<DropdownLabel>My account</DropdownLabel>
			</DropdownItem>
			<DropdownDivider />
			<DropdownItem href="/privacy">
				<ShieldCheckIcon />
				<DropdownLabel>Privacy policy</DropdownLabel>
			</DropdownItem>
			<DropdownItem href="">
				<LightBulbIcon />
				<DropdownLabel>Share feedback</DropdownLabel>
			</DropdownItem>
			<DropdownDivider />
			<DropdownItem>
				<ArrowRightStartOnRectangleIcon />
				<DropdownLabel>Sign out</DropdownLabel>
			</DropdownItem>
		</DropdownMenu>
	);
}

export function Sidebar({ sessions }) {
	const { data: authSession, status } = useSession();
	const pathname = usePathname();
	const router = useRouter();

	const [sessionsData, setSessionsData] = useState(sessions);
	const [selectedSession, setSelectedSession] = useState(sessions[0]?.number);
	const [selectedSessionData, setSelectedSessionData] = useState();
	const [isLoading, setIsLoading] = useState(false);
	const [schoolDirectorRole, setSchoolDirectorRole] = useState({});

	const basePath = `/medibook/sessions/${selectedSession}`;
	const pastRoles = authSession?.user.pastRoles;
	const currentRoles = authSession?.user.currentRoles;

	useEffect(() => {
		const getSessionFromPath = () => {
			const parts = pathname.split("/");
			if (parts.length >= 3 && parts[1] === "medibook" && parts[2] === "sessions") {
				return parts[3];
			}
			return null;
		};

		const sessionFromPath = getSessionFromPath();
		if (sessionFromPath) setSelectedSession(sessionFromPath);
	}, [pathname]);

	useEffect(() => {
		if (selectedSession) {
			let baseUrl = `/medibook/sessions/${selectedSession}`;
			const urlParts = pathname.split("/");
			if (urlParts.length > 4) {
				const additionalPath = urlParts.slice(4).join("/");
				baseUrl += `/${additionalPath}`;
			}
			if (pathname !== baseUrl && pathname.includes("/medibook/sessions/")) router.push(baseUrl);
		}
		handleSessionChange();
	}, [selectedSession]);

	let allCurrentAndPastRoles, schoolDirectorRoles;

	async function handleSessionChange() {
		let sessionData = await getSessionData(selectedSession);
		const sortedCommittees = sessionData?.committee.sort((a, b) => {
			const committeeType = ["GENERALASSEMBLY", "SECURITYCOUNCIL", "SPECIALCOMMITTEE"];
			return committeeType.indexOf(a.type) - committeeType.indexOf(b.type);
		});

		allCurrentAndPastRoles = [].concat(currentRoles).concat(pastRoles);
		schoolDirectorRoles = allCurrentAndPastRoles.filter((role) => role?.roleIdentifier === "schoolDirector");
		setSchoolDirectorRole(schoolDirectorRoles?.find((role) => role?.session === selectedSession));

		if (!sessionData?.committee) return;
		sessionData.committee = sortedCommittees;
		setSelectedSessionData(sessionData);
	}

	const isManagement = authorize(authSession, [s.management]);

	const committeeOptionsList = [
		{ name: "Overview", href: ``, isVisible: true },
		{ name: "Announcements", href: `/announcements`, isVisible: true },
		{ name: "Topics", href: `/topics`, isVisible: true },
		{ name: "Resolutions", href: `/resolutions`, isVisible: true },
		{ name: "Participants", href: `/participants`, isVisible: true },
		{ name: "Resources", href: `/resources`, isVisible: true },
		{ name: "Roll Calls", href: `/roll-calls`, isVisible: isManagement },
		{ name: "Settings", href: `/settings`, isVisible: isManagement },
	];

	const visibleCommitteeOptions = committeeOptionsList.filter((option) => option.isVisible);

	function CommitteeOptions({ basePath }) {
		return visibleCommitteeOptions.map((committee, index) => (
			<SidebarItem
				className={cn("h-8", index + 1 == visibleCommitteeOptions.length && "mb-2")}
				href={basePath + committee.href}
				current={pathname == basePath + committee.href}>
				<div slot="icon" className="flex min-w-[23px]">
					<div
						className={cn(
							"-my-[19px] mx-auto min-h-full w-[4px] bg-zinc-500 dark:bg-white",
							index + 1 == visibleCommitteeOptions.length && "rounded-b-full",
							index == 0 && "rounded-t-full"
						)}
					/>
				</div>
				<SidebarLabel>{committee.name}</SidebarLabel>
			</SidebarItem>
		));
	}

	async function loadMoreSessionsHandler() {
		setIsLoading(true);
		const moreSessions = await getMoreSessions(sessionsData.length);
		setSessionsData([...sessionsData, ...moreSessions]);
		setIsLoading(false);
	}

	useEffect(() => {
		handleSessionChange();
	}, [status]);

	const schoolDirectorBasePath = `/medibook/schools/${schoolDirectorRole?.schoolSlug || schoolDirectorRole?.schoolId}`;

	return (
		<>
			<SidebarComponent>
				<SidebarHeader>
					<Link href="/medibook" className="hidden md:block">
						<div className="mb-4 ml-[8px] mt-[4px] h-[16px] max-w-max drop-shadow hover:grayscale">
							<Image src={MediBookLogo} alt="MediBook" fill className="!relative" />
						</div>
					</Link>
					<Dropdown>
						<DropdownButton as={SidebarItem}>
							<Avatar slot="icon" initials={selectedSession} className="bg-primary text-white" />
							<SidebarLabel>Session {romanize(selectedSession)}</SidebarLabel>
							<ChevronDownIcon />
						</DropdownButton>
						<DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
							{sessionsData.map((session, index) => (
								<Fragment key={session.id}>
									<DropdownItem onClick={() => setSelectedSession(session.number)}>
										<Avatar
											slot="icon"
											initials={session.number}
											className={cn("bg-primary text-white", !index && "bg-[url(/gradients/1.jpg)] bg-cover")}
										/>
										<DropdownLabel className="flex">Session {romanize(session.number)}</DropdownLabel>
										<DropdownDescription>{session.theme}</DropdownDescription>
									</DropdownItem>
									{!index && <DropdownDivider />}
								</Fragment>
							))}
							<DropdownDivider />
							{!(sessionsData.filter((session) => session.numberInteger == 1).length > 0) && (
								<DropdownItem onClick={loadMoreSessionsHandler}>
									<PlusIcon />
									<DropdownLabel>Load More Sessions</DropdownLabel>
								</DropdownItem>
							)}
							<DropdownItem href="/medibook/sessions">
								<PlusIcon />
								<DropdownLabel>All Sessions</DropdownLabel>
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</SidebarHeader>
				<SidebarBody>
					<SidebarSection>
						<SidebarItem href="/medibook" current={pathname === "/medibook"}>
							<Icon slot="icon" icon="heroicons-solid:home" height={20} />
							<SidebarLabel>Home</SidebarLabel>
						</SidebarItem>
						<SidebarItem href="/medibook/messaging" current={pathname === "/medibook/messaging"}>
							<Icon slot="icon" icon="heroicons-solid:chat" height={20} />
							<SidebarLabel>Messaging</SidebarLabel>
						</SidebarItem>
						<SidebarItem href="/medibook/tasks" current={pathname === "/medibook/tasks"}>
							<Icon slot="icon" icon="heroicons-solid:clipboard-check" height={20} />
							<SidebarLabel>Tasks</SidebarLabel>
						</SidebarItem>
						<SidebarItem>
							<Icon slot="icon" icon="heroicons-solid:bell" height={20} />
							<SidebarLabel>Notifications</SidebarLabel>
						</SidebarItem>
						<SidebarItem href="/medibook/drive" current={pathname === "/medibook/drive"}>
							<Icon slot="icon" icon="heroicons-solid:inbox-in" height={20} />
							<SidebarLabel>Storage Drive</SidebarLabel>
						</SidebarItem>
					</SidebarSection>
					<SidebarSection>
						<SidebarHeading>General</SidebarHeading>
						<SidebarItem href="/medibook/schools" current={pathname.startsWith("/medibook/schools")}>
							<Icon slot="icon" icon="heroicons-solid:academic-cap" height={20} />
							<SidebarLabel>Schools</SidebarLabel>
						</SidebarItem>
						<SidebarItem href="/medibook/locations" current={pathname.startsWith("/medibook/locations")}>
							<Icon slot="icon" icon="heroicons-solid:location-marker" height={20} />
							<SidebarLabel>Locations</SidebarLabel>
						</SidebarItem>
						<SidebarItem href="/medibook/users" current={pathname.startsWith("/medibook/users")}>
							<Icon icon="heroicons-solid:users" height={20} />
							<SidebarLabel>All Users</SidebarLabel>
						</SidebarItem>
						<SidebarItem href="/medibook/sessions" current={pathname.startsWith("/medibook/sessions")}>
							<Icon slot="icon" icon="heroicons-solid:hashtag" height={20} />
							<SidebarLabel>Sessions</SidebarLabel>
						</SidebarItem>
						<SidebarItem href="/medibook/resources" current={pathname.startsWith("/medibook/resources")}>
							<Icon slot="icon" icon="heroicons-solid:folder" height={20} />
							<SidebarLabel>Resources</SidebarLabel>
						</SidebarItem>
					</SidebarSection>
					{schoolDirectorRole && (
						<SidebarSection>
							<SidebarHeading>School Management</SidebarHeading>
							<SidebarItem href={`${schoolDirectorBasePath}`} current={pathname == `${schoolDirectorBasePath}`}>
								<Icon slot="icon" icon="heroicons-solid:academic-cap" height={20} />
								<SidebarLabel>My School</SidebarLabel>
							</SidebarItem>
							<SidebarItem href={`${schoolDirectorBasePath}/students`} current={pathname == `${schoolDirectorBasePath}/students`}>
								<Icon icon="heroicons-solid:users" height={20} />
								<SidebarLabel>My Students</SidebarLabel>
							</SidebarItem>
							<SidebarItem href={`${schoolDirectorBasePath}/apply`} current={pathname == `${schoolDirectorBasePath}/apply`}>
								<Icon slot="icon" icon="heroicons-solid:document-add" height={20} />
								<SidebarLabel>Delegate Application</SidebarLabel>
							</SidebarItem>
							<SidebarItem href={`${schoolDirectorBasePath}/request-changes`} current={pathname == `${schoolDirectorBasePath}/request-changes`}>
								<Icon slot="icon" icon="heroicons-solid:pencil-alt" height={20} />
								<SidebarLabel>Request Changes</SidebarLabel>
							</SidebarItem>
						</SidebarSection>
					)}
					<SidebarSection>
						<SidebarHeading>Session {romanize(selectedSession)}</SidebarHeading>
						<SidebarItem href={`/medibook/sessions/${selectedSession}`} current={pathname == `/medibook/sessions/${selectedSession}`}>
							<Icon slot="icon" icon="heroicons-solid:home" height={20} />
							<SidebarLabel>Overview</SidebarLabel>
						</SidebarItem>
						<SidebarItem href={`${basePath}/committees`} current={pathname == `${basePath}/committees`}>
							<Icon icon="heroicons-solid:library" height={20} />
							<SidebarLabel>Committees</SidebarLabel>
						</SidebarItem>
						<SidebarItem href={`${basePath}/departments`} current={pathname == `${basePath}/departments`}>
							<Icon icon="heroicons-solid:briefcase" height={20} />
							<SidebarLabel>Departments</SidebarLabel>
						</SidebarItem>
						<SidebarItem href={`${basePath}/programme`} current={pathname == `${basePath}/programme`}>
							<Icon icon="heroicons-solid:calendar" height={20} />
							<SidebarLabel>Programme</SidebarLabel>
						</SidebarItem>
						<SidebarItem href={`${basePath}/participants`} current={pathname == `${basePath}/participants`}>
							<Icon icon="heroicons-solid:user-group" height={20} />
							<SidebarLabel>Participants</SidebarLabel>
						</SidebarItem>
						<SidebarItem href={`${basePath}/resources`} current={pathname == `${basePath}/resources`}>
							<Icon icon="heroicons-solid:folder" height={20} />
							<SidebarLabel>Resources</SidebarLabel>
						</SidebarItem>
						<SidebarItem href={`${basePath}/roll-calls`} current={pathname == `${basePath}/roll-calls`}>
							<Icon icon="heroicons-solid:clipboard-list" height={20} />
							<SidebarLabel>Roll Calls</SidebarLabel>
						</SidebarItem>
						<SidebarItem href={`${basePath}/settings`} current={pathname == `${basePath}/settings`}>
							<Icon icon="heroicons-solid:cog" height={20} />
							<SidebarLabel>Settings</SidebarLabel>
						</SidebarItem>
					</SidebarSection>
					{!!selectedSessionData?.committee?.length && (
						<SidebarSection>
							<SidebarHeading>Session {romanize(selectedSession)} Committees</SidebarHeading>
							{selectedSessionData?.committee?.map((committee, index: number) => (
								<Fragment key={index}>
									<SidebarItem
										href={`${basePath}/committees/${committee.slug || committee.id}`}
										current={pathname.includes(`${basePath}/committees/${committee.slug || committee.id}`)}>
										<div
											style={{ background: `url(/gradients/${(index % 6) + 1}.jpg)` }}
											className={`flex min-h-[23px] min-w-[23px] rounded-md  !bg-cover text-center`}
											slot="icon">
											<p className="m-auto text-[8px] text-black -mix-blend-overlay">{committee.shortName.slice(0, 3).toUpperCase()}</p>
										</div>
										<SidebarLabel>{committee.name}</SidebarLabel>
									</SidebarItem>
									{pathname.includes(`${basePath}/committees/${committee.slug || committee.id}`) && (
										<CommitteeOptions basePath={`${basePath}/committees/${committee.slug || committee.id}`} />
									)}
								</Fragment>
							))}
						</SidebarSection>
					)}
					{!!selectedSessionData?.department?.length && (
						<SidebarSection>
							<SidebarHeading>Session {romanize(selectedSession)} Departments</SidebarHeading>
							{selectedSessionData?.department?.map((department, index: number) => (
								<SidebarItem
									key={index}
									href={`${basePath}/departments/${department.slug || department.id}`}
									current={pathname == `${basePath}/departments/${department.slug || department.id}`}
									className="line-clamp-2">
									<div
										style={{ background: `url(/gradients/${(index % 6) + 1}.jpg)` }}
										className={`flex min-h-[23px] min-w-[23px] rounded-md !bg-cover text-center`}
										slot="icon">
										<p style={{ background: `url(/gradients/${(index % 6) + 1}.jpg)` }} className="m-auto !bg-cover !bg-clip-text text-[8px]">
											{department.shortName.slice(0, 3).toUpperCase()}
										</p>
									</div>
									<SidebarLabel>{department.name}</SidebarLabel>
								</SidebarItem>
							))}
						</SidebarSection>
					)}
					<SidebarSpacer />
					<SidebarSection>
						<SidebarItem href="/home">
							<SparklesIcon />
							<SidebarLabel>View Homepage</SidebarLabel>
						</SidebarItem>
					</SidebarSection>
				</SidebarBody>
				<SidebarFooter className="hidden lg:block">
					<Dropdown>
						<DropdownButton as={SidebarItem}>
							<span className="flex min-w-0 items-center gap-3">
								<NextUIAvatar
									src={`/api/users/${authSession?.user?.id}/avatar`}
									radius="sm"
									size="md"
									showFallback
									className="bg-primary text-white"
									alt="Profile Picture"
								/>
								<span className="min-w-0">
									<span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
										{authSession?.user?.displayName || `${authSession?.user?.officialName} ${authSession?.user?.officialSurname}`}
									</span>
									<span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
										{authSession?.user?.currentRoles[0]?.name}
									</span>
								</span>
							</span>
							<ChevronUpIcon />
						</DropdownButton>
						<AccountDropdownMenu anchor="top start" />
					</Dropdown>
				</SidebarFooter>
			</SidebarComponent>
		</>
	);
}
