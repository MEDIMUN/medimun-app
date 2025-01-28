"use client";

import { ChevronsUpDown, Plus } from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useSidebarContext } from "@/app/(medibook)/medibook/providers";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { authorize, s } from "@/lib/authorize";
import { useEffect, useState } from "react";
import { getMoreSessions, getSessionData } from "@/app/(medibook)/medibook/actions";
import { romanize } from "@/lib/romanize";

export function SessionSwitcher({ authSession, sessions }: { authSession; sessions: { number: string; theme: string; subTheme: string }[] }) {
	const { isMobile } = useSidebar();
	const { status } = useSession();
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
		setSchoolDirectorRoles,
		setDelegateRoles,
		setChairRoles,
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
		setDelegateRoles(
			allCurrentAndPastRoles.filter((role) => role?.roleIdentifier === "delegate")?.filter((role) => role?.session === selectedSession)
		);
		setChairRoles(allCurrentAndPastRoles.filter((role) => role?.roleIdentifier === "chair")?.filter((role) => role?.session === selectedSession));

		if (!sessionData?.committee) return;
		sessionData.committee = sortedCommittees;
		setSelectedSessionData(sessionData);
	}

	async function loadMoreSessionsHandler() {
		setIsLoading(true);
		const moreSessions = await getMoreSessions(sessionsData.length);
		setSessionsData((sessionsData || []).concat(moreSessions || []));
		console.log("sessionsData", moreSessions);
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

	useEffect(() => {
		console.log(selectedSession);
	}, [selectedSession]);

	const localSelected = sessionsData?.find((session) => session.number === selectedSession);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
							<div className="flex text-white aspect-square size-8 items-center justify-center rounded-lg bg-primary">{selectedSession}</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{localSelected?.theme || `Session ${romanize(localSelected?.numberInteger)}`}</span>
								{localSelected?.theme && <span className="truncate text-xs">Session {romanize(localSelected?.numberInteger)}</span>}
							</div>
							<ChevronsUpDown className="ml-auto" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						align="start"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}>
						<DropdownMenuLabel className="text-xs text-muted-foreground">Sessions</DropdownMenuLabel>
						{sessionsData?.map((conferenceSession, index) => (
							<DropdownMenuItem
								key={conferenceSession.number}
								onMouseDown={() => {
									setSelectedSession(conferenceSession.number);
								}}
								className="gap-2 p-2">
								<div className="flex size-6  items-center justify-center rounded-sm border">{conferenceSession.number}</div>
								<p className="line-clamp-1 truncate">{conferenceSession.theme || `Session ${romanize(conferenceSession.numberInteger)}`}</p>
							</DropdownMenuItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={(e) => {
								e.preventDefault();
								loadMoreSessionsHandler();
							}}
							className="gap-2 p-2">
							<div className="flex size-6 items-center justify-center rounded-md border bg-background">
								<Plus className="size-4" />
							</div>
							<div className="font-medium text-muted-foreground">Load more</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
