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
import Sidebar from "@/nextuipro/sidebar-with-teams";
import { Icon } from "@iconify/react";

export default function Component() {
	let { isHidden, setIsHidden, setIsDark, isDark } = useContext(SidebarContext);
	const { data: session, status } = useSession();
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

	return (
		<>
			{!isHidden && (
				<>
					<Sidebar isDark={isDark} setSelectedSession={setSelectedSession} selectedSession={selectedSession} sessions={sessions} />
					<div style={{ left: "252px" }} className="absolute top-[4px] md:hidden">
						<Button onPress={() => setIsHidden(true)} size="sm" color="" isIconOnly className="z-[100] rounded-full hover:bg-gray-200">
							<Icon className="text-default-500" icon="mingcute:close-line" width={16} />
						</Button>
					</div>
				</>
			)}
			<div className={`h-full w-0 border-r-[1px] border-r-divider duration-200 ${isHidden ? "w-0" : "md:w-[288px] md:min-w-[288px]"}`} />
		</>
	);
}
