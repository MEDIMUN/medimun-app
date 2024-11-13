"use client";

import { Avatar } from "@/components/avatar";
import { Avatar as NextUIAvatar } from "@nextui-org/avatar";
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
import {
	authorize,
	authorizeChairCommittee,
	authorizeDelegateCommittee,
	authorizeManagerDepartment,
	authorizeMemberDepartment,
	authorizePerSession,
	s,
} from "@/lib/authorize";
import { cn } from "@/lib/cn";
import { romanize } from "@/lib/romanize";
import { getSessionData } from "./actions";
import {
	ArrowRightStartOnRectangleIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	Cog8ToothIcon,
	HashtagIcon,
	HomeIcon,
	LightBulbIcon,
	PlusIcon,
	ShieldCheckIcon,
	SparklesIcon,
	UserCircleIcon,
	UserIcon,
} from "@heroicons/react/16/solid";
import { signOut, useSession } from "next-auth/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Fragment, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";
import { getMoreSessions } from "./actions";
import MediBookLogo from "@/public/assets/branding/logos/medibook-logo-white-2.svg";
import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "./providers";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { Text } from "@/components/text";
import { Heading } from "@/components/heading";
import { Badge } from "@/components/badge";
import { Cog6ToothIcon } from "@heroicons/react/20/solid";

export function AccountDropdownMenu({ anchor }: { anchor: "top start" | "bottom end" }) {
	const { data: authSession, status } = useSession();
	if (status === "authenticated")
		return (
			<DropdownMenu className="min-w-64" anchor={anchor}>
				<DropdownItem href="/medibook/account">
					<Cog6ToothIcon />
					<DropdownLabel>My Account</DropdownLabel>
				</DropdownItem>
				<DropdownItem href={`/medibook/users/${authSession?.user?.username || authSession?.user?.id}`}>
					<UserCircleIcon />
					<DropdownLabel>My Profile</DropdownLabel>
				</DropdownItem>
				<DropdownDivider />
				<DropdownItem href="/medibook/policies">
					<ShieldCheckIcon />
					<DropdownLabel>Conference Policies</DropdownLabel>
				</DropdownItem>
				<DropdownDivider />
				<DropdownItem href="/home">
					<HomeIcon />
					<DropdownLabel>View Homepage</DropdownLabel>
				</DropdownItem>
				<DropdownDivider />
				<DropdownItem
					onClick={() => {
						signOut();
					}}>
					<ArrowRightStartOnRectangleIcon />
					<DropdownLabel>Sign Out</DropdownLabel>
				</DropdownItem>
			</DropdownMenu>
		);
	return (
		<DropdownMenu className="min-w-64" anchor={anchor}>
			<DropdownItem disabled>
				<DropdownLabel>Loading...</DropdownLabel>
			</DropdownItem>
		</DropdownMenu>
	);
}

export function Sidebar({ sessions }) {
	const { data: authSession, status } = useSession();
	const pathname = usePathname() || "";
	const router = useRouter();
	const isManagement = authorize(authSession, [s.management]);

	const {
		sessionsData,
		setSessionsData,
		selectedSession,
		setSelectedSession,
		selectedSessionData,
		setSelectedSessionData,
		isLoading,
		setIsLoading,
		schoolDirectorRoles,
		setSchoolDirectorRoles,
		visibleSchoolOptionIds,
		setVisibleSchoolOptionIds,
		visibleSidebarOptions,
		setVisibleSidebarOptions,
	} = useSidebarContext();

	const basePath = `/medibook/sessions/${selectedSession}`;
	const pastRoles = authSession?.user.pastRoles;
	const currentRoles = authSession?.user.currentRoles;

	let allCurrentAndPastRoles;

	async function handleSessionChange() {
		let sessionData = await getSessionData(selectedSession);
		const sortedCommittees = sessionData?.committee?.sort((a, b) => {
			const committeeType = ["GENERALASSEMBLY", "SECURITYCOUNCIL", "SPECIALCOMMITTEE"];
			return committeeType.indexOf(a.type) - committeeType.indexOf(b.type);
		});

		allCurrentAndPastRoles = (currentRoles || []).concat(pastRoles || []);
		setSchoolDirectorRoles(
			allCurrentAndPastRoles.filter((role) => role?.roleIdentifier === "schoolDirector")?.filter((role) => role?.session === selectedSession)
		);

		if (!sessionData?.committee) return;
		sessionData.committee = sortedCommittees;
		setSelectedSessionData(sessionData);
	}

	async function loadMoreSessionsHandler() {
		setIsLoading(true);
		const moreSessions = await getMoreSessions(sessionsData.length);
		setSessionsData((sessionsData || []).concat(moreSessions || []));
		setIsLoading(false);
	}

	useEffect(() => {
		setSessionsData(sessions);
		setSelectedSession(sessions[0]?.number);
	}, []);

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

	useEffect(() => {
		handleSessionChange();
	}, [status]);

	function OptionsItem({ basePath, item, length, index }) {
		return (
			<SidebarItem
				disabled={item.isDisabled || item.isSoon}
				className={cn("h-8", index + 1 == length && "mb-2")}
				{...(item.isDisabled || item.isSoon ? {} : { href: basePath + item.href })}
				current={pathname == basePath + item.href}>
				<div slot="icon" className="flex min-w-[23px]">
					<div
						className={cn(
							"-my-[19px] mx-auto min-h-full w-[4px] bg-zinc-500 dark:bg-white",
							index + 1 == length && "rounded-b-full",
							index == 0 && "rounded-t-full"
						)}
					/>
				</div>
				<SidebarLabel>
					{item.name}
					{item.isSoon && <SoonBadge />}
				</SidebarLabel>
			</SidebarItem>
		);
	}

	function Departmentoptions({ basePath, departmentId }) {
		const allUserRoles = (authSession?.user?.pastRoles || []).concat(authSession?.user?.currentRoles || []);
		const isManagerOfCommittee = authorizeManagerDepartment(allUserRoles, departmentId);
		const isMemberOfDepartment = authorizeMemberDepartment(allUserRoles, departmentId);
		const isPartOfCommittee = isManagement || isManagerOfCommittee || isMemberOfDepartment;

		const departmentOptionsList = [
			{ name: "Overview", href: ``, isVisible: true, icon: "heroicons-solid:home" },
			{ name: "Announcements", href: `/announcements`, isVisible: isPartOfCommittee, icon: "heroicons-solid:speakerphone" },
			{ name: "Resources", href: `/resources`, isVisible: isPartOfCommittee, icon: "heroicons-solid:folder" },
			{ name: "Channels", href: `/channels`, isVisible: isPartOfCommittee, icon: "heroicons-solid:folder", isDisabled: true, isSoon: true },
			{ name: "Tasks", href: `/tasks`, isVisible: isPartOfCommittee, icon: "heroicons-solid:folder", isDisabled: true, isSoon: true },
			{ name: "Members", href: `/members`, isVisible: true, icon: "heroicons-solid:user-group" },
		].filter((o) => o.isVisible);

		return departmentOptionsList.map((item, index) => (
			<OptionsItem key={"department-options-" + index} basePath={basePath} item={item} length={departmentOptionsList.length} index={index} />
		));
	}

	function CommitteeOptions({ basePath, committeeId }) {
		const allUserRoles = (authSession?.user?.pastRoles || []).concat(authSession?.user?.currentRoles || []);
		const isChairOrDelegate = authorizeChairCommittee(allUserRoles, committeeId) || authorizeDelegateCommittee(allUserRoles, committeeId);
		const isManagementOrChairOrDelegate = isManagement || isChairOrDelegate;

		const committeeOptionsList = [
			{ name: "Overview", href: ``, isVisible: true, icon: "heroicons-solid:home" },
			{ name: "Chairs", href: `/chairs`, isVisible: true, icon: "heroicons-solid:user-group", isSoon: true },
			{ name: "Delegates", href: `/delegates`, isVisible: isManagementOrChairOrDelegate, icon: "heroicons-solid:user-group" },
			{ name: "Topics", href: `/topics`, isVisible: true, icon: "heroicons-solid:library" },
			{ name: "Announcements", href: `/announcements`, isVisible: isManagementOrChairOrDelegate, icon: "heroicons-solid:speakerphone" },
			{ name: "Resolutions", href: `/resolutions`, isVisible: isManagementOrChairOrDelegate, icon: "heroicons-solid:document-text" },
			{ name: "Tasks", href: `/tasks`, isVisible: isManagementOrChairOrDelegate, icon: "heroicons-solid:document-text", isSoon: true },
			{ name: "Channels", href: `/channels`, isVisible: isManagementOrChairOrDelegate, icon: "heroicons-solid:document-text", isSoon: true },
			{ name: "Resources", href: `/resources`, isVisible: isManagementOrChairOrDelegate, icon: "heroicons-solid:folder" },
			{ name: "Roll Calls", href: `/roll-calls`, isVisible: isManagement, icon: "heroicons-solid:clipboard-list" },
			{ name: "Settings", href: `/settings`, isVisible: isManagement, icon: "heroicons-solid:cog" },
		].filter((o) => o.isVisible);

		return committeeOptionsList.map((item, index) => (
			<OptionsItem key={"committee-options-" + index} basePath={basePath} item={item} length={committeeOptionsList.length} index={index} />
		));
	}

	function ApplicationOptions({ basePath }) {
		const applicationOptionsList = [
			{ name: "Status", href: `/applications/status`, isVisible: isManagement },
			{ name: "School Director", href: `/applications/school-director`, isVisible: isManagement },
			{ name: "Delegation", href: `/applications/delegation`, isVisible: isManagement },
			{ name: "Delegate Assignment", href: `/applications/assignment`, isVisible: isManagement },
			{ name: "Chair", href: `/applications/chair`, isVisible: isManagement, isDisabled: true },
			{ name: "Manager", href: `/applications/manager`, isVisible: isManagement, isDisabled: true },
			{ name: "Member", href: `/applications/member`, isVisible: isManagement, isDisabled: true },
		].filter((x) => x.isVisible);

		return applicationOptionsList.map((committee, index) => (
			<OptionsItem key={"application-options-" + index} basePath={basePath} item={committee} length={applicationOptionsList.length} index={index} />
		));
	}

	function SchoolDirectorOptions({ sdBasePath, role }) {
		const schoolDirectorSidebarItems = [
			{ name: "My School", href: `${sdBasePath}`, icon: "heroicons-solid:academic-cap" },
			{ name: "My Students", href: `${sdBasePath}/students`, icon: "heroicons-solid:users" },
			{
				name: "My Delegation",
				href: `/medibook/sessions/${selectedSession}/schools/${role?.schoolSlug || role?.schoolId}/delegation`,
				icon: "heroicons-solid:document-add",
			},
			{
				name: "Changes",
				href: `${sdBasePath}/request-changes`,
				icon: "heroicons-solid:pencil-alt",
				isSoon: true,
			},
			{
				name: "Certificates",
				href: `${sdBasePath}/request-changes`,
				icon: "heroicons-solid:newspaper",
				isSoon: true,
			},
			{
				name: "Awards",
				href: `${sdBasePath}/request-changes`,
				icon: "heroicons-solid:thumb-up",
				isSoon: true,
			},
			{
				name: "Reports",
				href: `${sdBasePath}/request-changes`,
				icon: "heroicons-solid:presentation-chart-line",
				isSoon: true,
			},
			{
				name: "Invoices",
				href: `/medibook/sessions/${selectedSession}/schools/${role?.schoolSlug || role?.schoolId}/invoices`,
				icon: "heroicons-solid:currency-euro",
			},
		];

		return schoolDirectorSidebarItems.map((item, index) => (
			<SidebarItem key={index} {...(item.isSoon ? {} : { href: item.href })} current={pathname === item.href} disabled={item.isSoon}>
				<Icon slot="icon" icon={item.icon} height={20} />
				<SidebarLabel>
					{item.name}
					{item.isSoon && <SoonBadge />}
				</SidebarLabel>
			</SidebarItem>
		));
	}

	function ShowHideButton({ isShown, onClick }) {
		if (isShown)
			return (
				<i className="cursor-pointer bg-zinc-200 rounded-md md:rounded-sm md:p-0 md:px-1 p-1 px-3 select-none" onClick={onClick}>
					Hide
				</i>
			);

		if (!isShown)
			return (
				<i className="cursor-pointer rounded-md bg-zinc-200 md:rounded-sm md:p-0 md:px-1 p-1 px-3 select-none" onClick={onClick}>
					Show
				</i>
			);
	}

	const SoonBadge = () => <Badge className="ml-1 !rounded-sm !text-xs">Coming Soon</Badge>;

	if (status === "authenticated")
		return (
			<>
				<SidebarComponent>
					<SidebarHeader>
						<Link href="/medibook" className="hidden md:block">
							<div className="mb-4 ml-[8px] mt-[4px] flex h-[16px] max-w-max drop-shadow hover:grayscale">
								<img src={`/assets/branding/logos/medibook-logo-white-2.svg`} className="h-[16px]" alt="MediBook" />
								<Badge className="ml-1 !rounded-full !bg-primary !text-white">beta</Badge>
							</div>
						</Link>
						<Dropdown>
							<DropdownButton as={SidebarItem}>
								<Avatar slot="icon" initials={selectedSession} className="bg-primary text-white" />
								<SidebarLabel>Session {romanize(selectedSession)}</SidebarLabel>
								<ChevronDownIcon />
							</DropdownButton>
							<DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
								{!!sessionsData?.length &&
									sessionsData.map((session: any, index: number) => (
										<Fragment key={"session-" + session.id}>
											<DropdownItem onClick={() => setSelectedSession(session.number)}>
												<Avatar
													slot="icon"
													initials={session.number.toString()}
													className={cn("bg-primary text-white", !index && "bg-[url(/assets/gradients/1.jpg)] bg-cover")}
												/>
												<DropdownLabel className="flex">Session {romanize(session.number)}</DropdownLabel>
												<DropdownDescription>{session.theme}</DropdownDescription>
											</DropdownItem>
											{!index && <DropdownDivider />}
										</Fragment>
									))}
								<DropdownDivider />
								{!(sessionsData?.filter((session) => session.numberInteger == 1).length > 0) && (
									<DropdownItem
										onClick={(e) => {
											loadMoreSessionsHandler();
											e.preventDefault();
										}}>
										<PlusIcon />
										<DropdownLabel>Load More Sessions</DropdownLabel>
									</DropdownItem>
								)}
								<DropdownItem href="/medibook/sessions">
									<HashtagIcon />
									<DropdownLabel>All Sessions</DropdownLabel>
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</SidebarHeader>
					<SidebarBody>
						<SidebarSection>
							<SidebarItem href="/medibook/register" className="bg-primary rounded-lg !text-white" current={pathname === "/medibook/register"}>
								<Icon slot="icon" className="text-white" icon="heroicons-solid:qrcode" height={20} />
								<SidebarLabel className="text-white">Morning Register</SidebarLabel>
							</SidebarItem>
						</SidebarSection>
						<SidebarSection>
							<SidebarItem href="/medibook" current={pathname === "/medibook"}>
								<Icon slot="icon" icon="heroicons-solid:home" height={20} />
								<SidebarLabel>Home</SidebarLabel>
							</SidebarItem>
							<SidebarItem href="/medibook/messenger" current={pathname === "/medibook/messenger"}>
								<Icon slot="icon" icon="heroicons-solid:chat" height={20} />
								<SidebarLabel>
									Messaging
									<SoonBadge />
								</SidebarLabel>
							</SidebarItem>
							<SidebarItem disabled href="/medibook/tasks" current={pathname === "/medibook/tasks"}>
								<Icon slot="icon" icon="heroicons-solid:clipboard-check" height={20} />
								<SidebarLabel>
									Tasks
									<SoonBadge />
								</SidebarLabel>
							</SidebarItem>
							<SidebarItem href="/medibook/policies" current={pathname === "/medibook/policies"}>
								<Icon slot="icon" icon="heroicons-solid:book-open" height={20} />
								<SidebarLabel>Policies</SidebarLabel>
							</SidebarItem>
							<SidebarItem href="/medibook/drive" current={pathname === "/medibook/drive"}>
								<Icon slot="icon" icon="heroicons-solid:inbox-in" height={20} />
								<SidebarLabel>Storage Drive</SidebarLabel>
							</SidebarItem>
						</SidebarSection>
						<SidebarSection>
							<SidebarHeading>
								General{" "}
								<ShowHideButton
									isShown={visibleSidebarOptions.includes("general")}
									onClick={() => {
										if (visibleSidebarOptions.includes("general")) {
											setVisibleSidebarOptions(visibleSidebarOptions.filter((id) => id != "general"));
										} else {
											setVisibleSidebarOptions([...visibleSidebarOptions, "general"]);
										}
									}}
								/>
							</SidebarHeading>
							{visibleSidebarOptions.includes("general") && (
								<>
									{isManagement && (
										<>
											<SidebarItem href="/medibook/schools" current={pathname?.startsWith("/medibook/schools")}>
												<Icon slot="icon" icon="heroicons-solid:academic-cap" height={20} />
												<SidebarLabel>Schools</SidebarLabel>
											</SidebarItem>
											<SidebarItem href="/medibook/locations" current={pathname?.startsWith("/medibook/locations")}>
												<Icon slot="icon" icon="heroicons-solid:location-marker" height={20} />
												<SidebarLabel>Locations</SidebarLabel>
											</SidebarItem>
											<SidebarItem href="/medibook/users" current={pathname?.startsWith("/medibook/users")}>
												<Icon icon="heroicons-solid:users" height={20} />
												<SidebarLabel>All Users</SidebarLabel>
											</SidebarItem>
										</>
									)}
									<SidebarItem href="/medibook/sessions" current={pathname == "/medibook/sessions"}>
										<Icon slot="icon" icon="heroicons-solid:hashtag" height={20} />
										<SidebarLabel>Sessions</SidebarLabel>
									</SidebarItem>
									<SidebarItem href="/medibook/announcements" current={pathname?.startsWith("/medibook/announcements")}>
										<Icon slot="icon" icon="heroicons-solid:speakerphone" height={19} />
										<SidebarLabel>Announcements</SidebarLabel>
									</SidebarItem>
									<SidebarItem href="/medibook/resources" current={pathname?.startsWith("/medibook/resources")}>
										<Icon slot="icon" icon="heroicons-solid:folder" height={20} />
										<SidebarLabel>Resources</SidebarLabel>
									</SidebarItem>
									<SidebarItem href={`/medibook/invoices`} current={pathname == `/medibook/invoices`}>
										<Icon icon="heroicons-solid:currency-euro" height={20} />
										<SidebarLabel>Individual Invoices</SidebarLabel>
									</SidebarItem>
								</>
							)}
						</SidebarSection>

						{!!schoolDirectorRoles.length &&
							status === "authenticated" &&
							schoolDirectorRoles.map((role) => {
								const sdBasePath = `/medibook/schools/${role?.schoolSlug || role?.schoolId}`;
								return (
									<SidebarSection key={"school-director-role" + role.id}>
										<SidebarHeading className="line-clamp-1">
											{schoolDirectorRoles.length == 1 ? "School Management" : role.school}{" "}
											<ShowHideButton
												isShown={visibleSchoolOptionIds.includes(role.schoolId)}
												onClick={() => {
													if (visibleSchoolOptionIds.includes(role.schoolId)) {
														setVisibleSchoolOptionIds(visibleSchoolOptionIds.filter((id) => id != role.schoolId));
													} else {
														setVisibleSchoolOptionIds([...visibleSchoolOptionIds, role.schoolId]);
													}
												}}
											/>
										</SidebarHeading>
										{visibleSchoolOptionIds.includes(role.schoolId) && <SchoolDirectorOptions sdBasePath={sdBasePath} role={role} />}
									</SidebarSection>
								);
							})}
						{selectedSessionData?.applicationsOpen && !authorizePerSession(authSession, [s.schooldirector], [selectedSession]) && (
							<SidebarSection>
								<SidebarHeading>Individual Applications</SidebarHeading>
								<SidebarItem
									href={`/medibook/sessions/${selectedSession}/apply/school-director`}
									current={pathname == `/medibook/sessions/${selectedSession}/apply/school-director`}>
									<Icon slot="icon" icon="heroicons-solid:academic-cap" height={20} />
									<SidebarLabel>School Director</SidebarLabel>
								</SidebarItem>
							</SidebarSection>
						)}
						{/* {authorize(authSession, [s.chair, s.delegate]) && (
							<SidebarSection>
								<SidebarHeading>
									My Committee <i>Coming Soon</i>
								</SidebarHeading>
							</SidebarSection>
						)}
						{authorize(authSession, [s.member, s.manager]) && (
							<SidebarSection>
								<SidebarHeading>
									My Department <i>Coming Soon</i>
								</SidebarHeading>
							</SidebarSection>
						)} */}
						{!!sessionsData?.length && (
							<SidebarSection>
								<SidebarHeading>
									Session {romanize(selectedSession)}{" "}
									<ShowHideButton
										isShown={visibleSidebarOptions.includes("session-general")}
										onClick={() => {
											if (visibleSidebarOptions.includes("session-general")) {
												setVisibleSidebarOptions(visibleSidebarOptions.filter((id) => id != "session-general"));
											} else {
												setVisibleSidebarOptions([...visibleSidebarOptions, "session-general"]);
											}
										}}
									/>
								</SidebarHeading>
								{visibleSidebarOptions.includes("session-general") && (
									<>
										<SidebarItem href={`/medibook/sessions/${selectedSession}`} current={pathname == `/medibook/sessions/${selectedSession}`}>
											<Icon slot="icon" icon="heroicons-solid:home" height={20} />
											<SidebarLabel>Overview</SidebarLabel>
										</SidebarItem>
										<SidebarItem href={`${basePath}/announcements`} current={pathname == `${basePath}/announcements`}>
											<Icon icon="heroicons-solid:speakerphone" height={19} />
											<SidebarLabel>Announcements</SidebarLabel>
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
										{isManagement && (
											<SidebarItem href={`${basePath}/invoices`} current={pathname == `${basePath}/invoices`}>
												<Icon icon="heroicons-solid:currency-euro" height={20} />
												<SidebarLabel>Invoices</SidebarLabel>
											</SidebarItem>
										)}
										{isManagement && (
											<>
												<SidebarItem href={`${basePath}/applications`} current={pathname == `${basePath}/applications`}>
													<Icon icon="heroicons-solid:document-download" height={20} />
													<SidebarLabel>Applications</SidebarLabel>
												</SidebarItem>
												{pathname?.includes(`${basePath}/applications`) && <ApplicationOptions basePath={basePath} />}
											</>
										)}
										<SidebarItem href={`${basePath}/resources`} current={pathname == `${basePath}/resources`}>
											<Icon icon="heroicons-solid:folder" height={20} />
											<SidebarLabel>Resources</SidebarLabel>
										</SidebarItem>
										{isManagement && (
											<SidebarItem href={`${basePath}/roll-calls`} current={pathname == `${basePath}/roll-calls`}>
												<Icon icon="heroicons-solid:clipboard-list" height={20} />
												<SidebarLabel>Roll Calls</SidebarLabel>
											</SidebarItem>
										)}
										{isManagement && (
											<SidebarItem href={`${basePath}/settings`} current={pathname == `${basePath}/settings`}>
												<Icon icon="heroicons-solid:cog" height={20} />
												<SidebarLabel>Settings</SidebarLabel>
											</SidebarItem>
										)}
									</>
								)}
							</SidebarSection>
						)}
						{!!selectedSessionData?.committee?.length && (
							<SidebarSection>
								<SidebarHeading>Session {romanize(selectedSession)} Committees</SidebarHeading>
								{selectedSessionData?.committee?.map((committee, index: number) => (
									<Fragment key={"session-committee-" + committee.id}>
										<SidebarItem href={`${basePath}/committees/${committee.slug || committee.id}`}>
											<div
												className={`flex min-h-[23px] ring-1 bg-zinc-200 shadow-md ring-zinc-300 min-w-[23px] rounded-md !bg-cover text-center`}
												slot="icon">
												<p className="m-auto text-[8px] text-black -mix-blend-overlay">{committee.shortName.slice(0, 3).toUpperCase()}</p>
											</div>
											<SidebarLabel>{committee.name}</SidebarLabel>
										</SidebarItem>
										{pathname?.includes(`${basePath}/committees/${committee.slug || committee.id}`) && (
											<CommitteeOptions committeeId={committee.id} basePath={`${basePath}/committees/${committee.slug || committee.id}`} />
										)}
									</Fragment>
								))}
							</SidebarSection>
						)}
						{!!selectedSessionData?.department?.length && (
							<SidebarSection>
								<SidebarHeading>Session {romanize(selectedSession)} Departments</SidebarHeading>
								{selectedSessionData?.department?.map((department, index: number) => (
									<Fragment key={department.id}>
										<SidebarItem
											key={"session-department-" + department.id}
											href={`${basePath}/departments/${department.slug || department.id}`}
											className="line-clamp-2">
											<div
												className={`flex min-h-[23px] ring-1 bg-zinc-200 shadow-md ring-zinc-300 min-w-[23px] rounded-full !bg-cover text-center`}
												slot="icon">
												<div
													style={{ background: `url(/assets/gradients/${(index % 6) + 1}.jpg)` }}
													className="m-auto !bg-cover !bg-clip-text text-[8px]">
													{department.shortName ? (
														department.shortName.slice(0, 3).toUpperCase()
													) : (
														<div className="h-2 w-2 bg-zinc-500 rounded-full"></div>
													)}
												</div>
											</div>
											<SidebarLabel>{department.name}</SidebarLabel>
										</SidebarItem>
										{pathname?.includes(`${basePath}/departments/${department.slug || department.id}`) && (
											<Departmentoptions departmentId={department.id} basePath={`${basePath}/departments/${department.slug || department.id}`} />
										)}
									</Fragment>
								))}
							</SidebarSection>
						)}
					</SidebarBody>
					<SidebarFooter className="hidden lg:block">
						<Dropdown>
							<DropdownButton as={SidebarItem}>
								<span className="flex min-w-0 items-center gap-3">
									<NextUIAvatar
										src={status === "authenticated" ? `/api/users/${authSession?.user?.id}/avatar` : null}
										radius="sm"
										size="md"
										showFallback
										className="bg-primary text-white"
										alt="Profile Picture"
									/>
									<span className="min-w-0">
										{status === "authenticated" && (
											<>
												<span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
													{authSession?.user?.displayName || `${authSession?.user?.officialName} ${authSession?.user?.officialSurname}`}
												</span>
												<span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
													{authSession?.user?.currentRoles[0]?.name || authSession.user.id}
												</span>
											</>
										)}
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

	return null;
}

{
	/* <Popover className="w-full">
								<PopoverButton as={SidebarItem} className="w-full">
									<Icon slot="icon" icon="heroicons-solid:bell" height={20} />
									<SidebarLabel>Notifications</SidebarLabel>
								</PopoverButton>
								<PopoverPanel
									transition
									anchor="left start"
									className="absolute h-64 w-64 -translate-x-8 -translate-y-6 rounded-lg bg-white text-sm/6 shadow-md ring-1 ring-zinc-950/5 transition duration-200 ease-in-out [--anchor-gap:var(--spacing-5)] data-[closed]:-translate-y-1 data-[closed]:opacity-0">
									<div className="absolute h-full w-full bg-zinc-50 px-3 py-2 ring-1">
										<Text>Notifications</Text>
									</div>
								</PopoverPanel>
							</Popover> */
}
