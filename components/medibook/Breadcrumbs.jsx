"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { useEffect, useState } from "react";
import { Skeleton } from "@components/ui/skeleton";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import MediBookLogo from "@public/assets/branding/logos/medibook-logo-white-2.svg";
import MediBookBadge from "@public/assets/branding/badges/medibook-badge-white-1.svg";
import { useRouter } from "next/navigation";

export default function Breadcrumb() {
	const { data: session, status, update } = useSession();
	if (status === "authenticated" && session.isDisabled) signOut();
	const pathname = usePathname();
	const router = useRouter();
	const [currentPath, setCurrentPath] = useState([]);

	const Separator = (props) => {
		return (
			<div className={`pl-[3px] pr-[3px] ${props.className}`}>
				<svg
					style={{ height: "32px", width: "32px", color: "#EAEAEA" }}
					fill="none"
					height="32"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1"
					viewBox="0 0 24 24"
					width="32">
					<path d="M16.88 3.549L7.12 20.451"></path>
				</svg>
			</div>
		);
	};

	const layerOneMap = {
		sessions: "Sessions",
		announcements: "Announcements",
		users: "Users",
	};

	useEffect(() => {
		setCurrentPath(
			pathname
				.split("/")
				.filter((item) => item !== "")
				.filter((item) => item !== "medibook")
		);
		//update();
	}, [pathname]);

	return (
		<div className="fdr my-1.5 flex max-h-[50px] w-[100%] items-center pl-[20px]">
			<Link href="/medibook">
				<div className="fdr justifi-middle flex items-center">
					<Image alt="MediBook Logo" className="hidden fill-black grayscale hover:filter-none md:block" src={MediBookLogo} height={16} />
					<Image alt="MediBook Badge" className="min-w-[33px] max-w-[35px] grayscale hover:filter-none md:hidden" src={MediBookBadge} />
					{/* 					<sup className="font-['canela'] font-extralight text-gray-600">beta</sup>
					 */}{" "}
				</div>
			</Link>

			{status == "authenticated" && (
				<>
					<Separator className="hidden md:block" />
					<Avatar className="mr-[8px] hidden h-[30px] w-[30px] md:block">
						<AvatarImage src={`/api/user/${session.user.userNumber}/profilePicture`} />
						<AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">{session.user.officialName[0] + session.user.officialSurname[0]}</AvatarFallback>
					</Avatar>
					<p className="weig hidden h-[20px] truncate text-sm font-medium md:block">{session.user.officialName + " " + session.user.officialSurname}</p>
					<Badge className="ml-[8px] hidden truncate md:block">{session.currentRoleNames[0] || (session.pastRoleNames.length == 0 ? "Applicant" : "Alumni")}</Badge>
				</>
			)}
			{currentPath.length > 1 && (
				<>
					<Separator />
					<Link href={`/medibook/${currentPath[0]}`}>
						<div
							before={"←" + " "}
							className="flex flex-row rounded-2xl from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% duration-500 hover:bg-gradient-to-r hover:px-4 hover:py-1 hover:text-white hover:shadow-2xl hover:before:content-[attr(before)]">
							<p className="font-thin ">{layerOneMap[currentPath[0]]} </p>
						</div>
					</Link>
				</>
			)}
			{currentPath[0] == "sessions" && currentPath.length !== 1 && (
				<>
					<Separator />
					<Link href={`/medibook/sessions/${currentPath[1]}`}>
						<div
							before={"←" + " "}
							className="flex flex-row rounded-2xl from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% duration-500 hover:bg-gradient-to-r hover:px-4 hover:py-1 hover:text-white hover:shadow-2xl hover:before:content-[attr(before)]">
							<p className="font-thin ">Session {currentPath[1]}</p>
						</div>
					</Link>
				</>
			)}

			{/* 			<Badge className="bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%">19</Badge>
			 */}
			<div className="h-[30px] max-h-[30px] w-[64px] "></div>
		</div>
	);
}
