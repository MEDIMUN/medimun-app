"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { useEffect } from "react";
import { Skeleton } from "@components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import MediBookLogo from "@public/assets/branding/logos/medibook-logo-white-2.svg";
import MediBookBadge from "@public/assets/branding/badges/medibook-badge-white-1.svg";

export default function Breadcrumb() {
	const { data: session, status } = useSession();
	if (status === "authenticated" && session.isDisabled) signOut();

	const Separator = () => {
		return (
			<div className="pr-[3px] pl-[3px]">
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

	return (
		<div className="max-h-[50px] flex fdr items-center w-[100%] my-1.5 pl-[20px]">
			<Link href="/medibook">
				<div className="flex fdr items-center justifi-middle">
					<Image
						alt="MediBook Logo"
						className="fill-black grayscale hover:filter-none hidden md:block"
						src={MediBookLogo}
						height={16}
					/>
					<Image
						alt="MediBook Badge"
						className="min-w-[33px] grayscale hover:filter-none max-w-[35px] md:hidden"
						src={MediBookBadge}
					/>
				</div>
			</Link>
			<Separator />
			{status == "authenticated" && (
				<>
					<Avatar className="w-[30px] h-[30px] mr-[8px]">
						<AvatarImage src={`/api/user/${session.user.userNumber}/profilePicture`} />
						<AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
							{session.user.officialName[0] + session.user.officialSurname[0]}
						</AvatarFallback>
					</Avatar>
					<p className="h-[20px] weig text-sm font-medium truncate">{session.user.preferredName}</p>{" "}
					<Badge className="ml-[8px] hidden md:block truncate">
						{session.currentRoleNames[0] ||
							(session.pastRoleNames.length == 0 ? "Applicant" : "Alumni")}
					</Badge>
				</>
			)}
			{status == "loading" && <Skeleton className="h-5 w-[100px] bg-gray-300" />}
			{status == "unauthenticated" && <Skeleton className="h-5 w-[100px] bg-red-600" />}
			<Separator />
			<div className="w-[64px] h-[30px] max-h-[30px] ">
				<Select>
					<SelectTrigger className="w-[64px] h-[30px] max-h-[30px] border-none">{}</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Session</SelectLabel>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
