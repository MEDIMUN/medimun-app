"use client";

import * as React from "react";
import {
	AudioWaveform,
	BadgeEuro,
	BookOpen,
	Bot,
	Command,
	Frame,
	GalleryVerticalEnd,
	GraduationCap,
	House,
	Map,
	MessageSquareMore,
	PackageOpen,
	PieChart,
	ScanQrCode,
	Settings2,
	Speech,
	SquareTerminal,
	UsersRound,
	Lectern,
	MapPinHouse,
	School,
	Layers,
	ScrollText,
	Megaphone,
	Folder,
	BriefcaseBusiness,
	CalendarRange,
	FilePenLine,
	ListTodo,
	CircleDashed,
	SquareDashed,
	Printer,
} from "lucide-react";

import { NavCollapsible } from "@/components/nav-collapsible";
import { SimpleSection } from "@/components/nav-simple-section";
import { NavUser } from "@/components/nav-user";
import { SessionSwitcher } from "@/components/session-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarRail } from "@/components/ui/sidebar";
import { FastLink } from "./fast-link";
import { useSession } from "next-auth/react";
import { arrayFromNumber } from "@/lib/array-from-number";
import { useSidebarContext } from "@/app/(medibook)/medibook/providers";
import { authorize, authorizeChairCommittee, authorizeDelegateCommittee, authorizeDirect, authorizeManagerDepartment, authorizeMemberDepartment, s } from "@/lib/authorize";
import { romanize } from "@/lib/romanize";

// This is sample data

export function AppSidebar({ sessions, authSession, ...props }: React.ComponentProps<typeof Sidebar>) {
	const { schoolDirectorRoles, selectedSession, delegateRoles, chairRoles, selectedSessionData, memberRoles, managerRoles } = useSidebarContext();
	const isManagement = authorize(authSession, [s.management]);

	function committeeOptions({ committeeId, committeeSlug, committee }) {
		const allUserRoles = (authSession?.user?.pastRoles || []).concat(authSession?.user?.currentRoles || []);
		const isChair = authorizeChairCommittee(allUserRoles, committeeId);
		const isDelegate = authorizeDelegateCommittee(allUserRoles, committeeId);
		const isChairOrDelegate = isChair || isDelegate;
		const isManagementOrChairOrDelegate = isManagement || isChairOrDelegate;
		const basePath = `/medibook/sessions/${selectedSession}/committees/${committeeSlug || committeeId}`;
		return {
			title: committee,
			icon: CircleDashed,
			url: `/medibook/sessions/${selectedSession}/committees/${committeeSlug || committeeId}`,
			items: [
				{ title: "Overview", url: basePath, isVisible: true },
				{ title: "Floor", url: `${basePath}/floor`, isVisible: true },
				{ title: "Topics", url: `${basePath}/topics`, isVisible: true },
				{ title: "Chairs", url: `${basePath}/chairs`, isVisible: true },
				{ title: "Delegates", url: `${basePath}/delegates`, isVisible: isManagementOrChairOrDelegate },
				{ title: "Announcements", url: `${basePath}/announcements`, isVisible: isManagementOrChairOrDelegate },
				{ title: "Resolutions", url: `${basePath}/resolutions`, isVisible: isManagementOrChairOrDelegate },
				{ title: "Chat", url: `${basePath}/chat`, isVisible: isManagementOrChairOrDelegate },
				{ title: "Position Papers", url: `${basePath}/position-papers`, isVisible: isManagementOrChairOrDelegate },
				{ title: "Resources", url: `${basePath}/resources`, isVisible: isManagementOrChairOrDelegate },
				{ title: "Roll Calls", url: `${basePath}/roll-calls`, isVisible: isManagement || isChair },
				{ title: "Settings", url: `${basePath}/settings`, isVisible: isManagement },
			].filter((item) => item.isVisible),
		};
	}

	function departmentOptions({ departmentId, departmentSlug, department }) {
		const allUserRoles = (authSession?.user?.pastRoles || []).concat(authSession?.user?.currentRoles || []);
		const isManagerOfCommittee = authorizeManagerDepartment(allUserRoles, departmentId);
		const isMemberOfDepartment = authorizeMemberDepartment(allUserRoles, departmentId);
		const isPartOfCommittee = isManagement || isManagerOfCommittee || isMemberOfDepartment;
		const basePath = `/medibook/sessions/${selectedSession}/departments/${departmentSlug || departmentId}`;
		return {
			title: department,
			icon: SquareDashed,
			url: `/medibook/sessions/${selectedSession}/departments/${departmentSlug || departmentId}`,
			items: [
				{ title: "Overview", url: basePath, isVisible: true },
				{ title: "Members", url: `${basePath}/members`, isVisible: true },
				{ title: "Announcements", url: `${basePath}/announcements`, isVisible: isPartOfCommittee },
				{ title: "Resources", url: `${basePath}/resources`, isVisible: isPartOfCommittee },
				{ title: "Channels", url: `${basePath}/channels`, isVisible: isPartOfCommittee },
			].filter((item) => item.isVisible),
		};
	}

	const schoolDirectorLinks = schoolDirectorRoles?.length
		? schoolDirectorRoles.map((role) => {
				const schoolBasePath = `/medibook/schools/${role.schoolSlug || role.schoolId}`;
				const sessionBasePath = `/medibook/sessions/${selectedSession}/schools/${role.schoolSlug || role.schoolId}`;
				return {
					title: role.school,
					url: `/medibook/schools/${role.schoolSlug || role.schoolId}`,
					items: [
						{ title: "Overview", url: schoolBasePath },
						{ title: "Students", url: `${schoolBasePath}/students` },
						{ title: "Delegation", url: `${sessionBasePath}/delegation` },
						{ title: "Invoices", url: `${sessionBasePath}/invoices` },
					],
				};
			})
		: [];

	const myCommitteeLinks = (!!delegateRoles?.length ? delegateRoles : []).concat(!!chairRoles?.length ? chairRoles : []).map(committeeOptions);
	const sessionCommitteeLinks = !!selectedSessionData?.committee?.length
		? selectedSessionData.committee.map((committee) => {
				return committeeOptions({
					committeeId: committee.id,
					committeeSlug: committee.slug,
					committee: committee.name,
				});
			})
		: [];

	const myDepartmentLinks = (!!memberRoles?.length ? memberRoles : []).concat(!!managerRoles?.length ? managerRoles : []).map(committeeOptions);
	const sessionDepartmentLinks = !!selectedSessionData?.department?.length
		? selectedSessionData.department.map((department) => {
				return departmentOptions({
					departmentId: department.id,
					departmentSlug: department.slug,
					department: department.name,
				});
			})
		: [];

	const generalItems = [
		{
			title: "Home",
			url: "/medibook",
			icon: House,
		},
		{
			title: "Check In",
			url: "/medibook/register",
			icon: ScanQrCode,
		},
		{
			title: "Messages",
			url: "/medibook/messenger",
			icon: MessageSquareMore,
		},
		{
			title: "Drive",
			url: "/medibook/drive",
			icon: PackageOpen,
		},
		{
			title: "Invoices",
			url: "/medibook/invoices",
			icon: BadgeEuro,
		},
	];

	const globalItems = [
		{
			title: "Schools",
			url: "/medibook/schools",
			icon: School,
			isVisible: isManagement,
		},
		{
			title: "Locations",
			url: "/medibook/locations",
			icon: MapPinHouse,
			isVisible: isManagement,
		},
		{
			title: "All Users",
			url: "/medibook/users",
			icon: UsersRound,
			isVisible: isManagement,
		},
		{
			title: "Sessions",
			url: "/medibook/sessions",
			icon: Layers,
			isVisible: true,
		},
		{
			title: "Announcements",
			url: "/medibook/announcements",
			icon: Megaphone,
			isVisible: true,
		},
		{
			title: "Resources",
			url: "/medibook/resources",
			icon: Folder,
			isVisible: true,
		},
		{
			title: "Policies",
			url: "/medibook/policies",
			icon: ScrollText,
			isVisible: true,
		},
	].filter((item) => item.isVisible);

	const sessionBasePath = `/medibook/sessions/${selectedSession}`;
	const allRoles = (authSession?.user?.pastRoles || []).concat(authSession?.user?.currentRoles || []).filter((role) => role.session == selectedSession);
	const allManagerRoles = allRoles.filter((role) => role?.roleIdentifier == "manager");
	const allMemberRoles = allRoles.filter((role) => role?.roleIdentifier == "member");

	const isManagerOfApprovalPanel = allManagerRoles.some((role) => role?.departmentTypes.includes("APPROVAL"));
	const isMemberOfApprovalPanel = allMemberRoles.some((role) => role?.departmentTypes.includes("APPROVAL"));

	const isManagerOrMemberOfApprovalPanel = isManagerOfApprovalPanel || isMemberOfApprovalPanel;

	const sessionItems = [
		{
			title: "Overview",
			url: sessionBasePath,
			icon: House,
			isVisible: true,
		},
		{
			title: "Announcements",
			url: `${sessionBasePath}/announcements`,
			icon: Megaphone,
			isVisible: true,
		},
		{
			title: "Committees",
			url: `${sessionBasePath}/committees`,
			icon: Lectern,
			isVisible: true,
			/* items: [
				{
					title: "Overview",
					url: `${sessionBasePath}/committees`,
					icon: House,
				},
				...sessionCommitteeLinks,
			], */
		},
		{
			title: "Departments",
			url: `${sessionBasePath}/departments`,
			icon: BriefcaseBusiness,
			isVisible: true,
			/* items: [
				{
					title: "Overview",
					url: `${sessionBasePath}/departments`,
					icon: House,
				},
				...sessionDepartmentLinks,
			], */
		},
		{
			title: "Programme",
			url: `${sessionBasePath}/programme`,
			icon: CalendarRange,
			isVisible: true,
		},
		{
			title: "Participants",
			url: `${sessionBasePath}/participants`,
			icon: UsersRound,
			isVisible: true,
		},
		{
			title: "Invoices",
			url: `${sessionBasePath}/invoices`,
			icon: BadgeEuro,
			isVisible: isManagement,
		},
		{
			title: "Applications",
			url: `${sessionBasePath}/applications`,
			icon: FilePenLine,
			isVisible: isManagement,
			items: [
				{ title: "Status", url: `${sessionBasePath}/applications/status`, isVisible: isManagement },
				{ title: "School Director", url: `${sessionBasePath}/applications/school-director`, isVisible: isManagement },
				{ title: "Delegation", url: `${sessionBasePath}/applications/delegation`, isVisible: isManagement },
				{ title: "Delegate Assignment", url: `${sessionBasePath}/applications/assignment`, isVisible: isManagement },
				{ title: "Chair", url: `${sessionBasePath}/applications/chair`, isVisible: isManagement, isDisabled: true },
				{ title: "Manager", url: `${sessionBasePath}/applications/manager`, isVisible: isManagement, isDisabled: true },
				{ title: "Member", url: `${sessionBasePath}/applications/member`, isVisible: isManagement, isDisabled: true },
			].filter((item) => item.isVisible),
		},
		{
			title: "Resources",
			url: `${sessionBasePath}/resources`,
			icon: Folder,
			isVisible: true,
		},
		{
			title: "Approval Panel",
			url: `${sessionBasePath}/approval-panel`,
			icon: CalendarRange,
			isVisible: isManagement || isManagerOrMemberOfApprovalPanel,
		},
		{
			title: "Roll Calls",
			url: `${sessionBasePath}/roll-calls`,
			icon: ListTodo,
			isVisible: isManagement,
		},
		{
			title: "Print Centre",
			url: `${sessionBasePath}/print`,
			icon: Printer,
			isVisible: isManagement,
		},
		{
			title: "Settings",
			url: `${sessionBasePath}/settings`,
			icon: Settings2,
			isVisible: isManagement,
		},
	].filter((item) => item.isVisible);

	const isChair = authorizeDirect(authSession, [s.chair]);

	const user = {
		name: `${authSession?.user?.officialName} ${authSession?.user?.officialSurname}`,
		email: authSession?.user.currentRoleNames[0] ? (authSession?.user.currentRoleNames[0] == "School Director" && isChair ? "Chair" : authSession?.user.currentRoleNames[0]) : authSession?.user.id,
		avatar: `/api/users/${authSession?.user?.id}/avatar`,
		id: authSession?.user?.id,
		username: authSession?.user?.username,
	};

	return (
		<Sidebar variant="sidebar" className="max-h-svh top-0" collapsible={"undefined"} {...props}>
			<SidebarHeader className="border-b border-sidebar-border">
				<SessionSwitcher authSession={authSession} sessions={sessions} />
			</SidebarHeader>

			<SidebarContent title="MediBook">
				{!!myCommitteeLinks.length && <NavCollapsible title="My Committees" items={myCommitteeLinks} />}
				{!!myDepartmentLinks.length && <NavCollapsible title="My Departments" items={myDepartmentLinks} />}
				{!!schoolDirectorLinks.length && <NavCollapsible title="My Schools" items={schoolDirectorLinks} />}

				<SimpleSection items={generalItems} title="General" />
				<SimpleSection items={globalItems} title="Global" />

				<SimpleSection items={sessionItems} title={`Session ${romanize(selectedSession)}`} />
				{!!sessionCommitteeLinks.length && <NavCollapsible title="Session Committees" items={sessionCommitteeLinks} />}
				{!!sessionDepartmentLinks.length && <NavCollapsible title="Session Departments" items={sessionDepartmentLinks} />}
			</SidebarContent>

			<SidebarFooter className="border-t border-sidebar-border">
				<NavUser user={user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
