"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { Fragment, useEffect } from "react";
import { Skeleton } from "@components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

import MediBookLogo from "@public/assets/branding/logos/medibook-logo-white-2.svg";
import MediBookBadge from "@public/assets/branding/badges/medibook-badge-white-1.svg";

export default function Breadcrumb() {
	const { data, error, refetch, isError, isLoading } = useQuery({
		queryKey: ["user"],
		queryFn: async () => {
			return (await axios.get("/api/sessions")).data;
		},
	});

	const Separator = () => {
		return (
			<div className="pr-[3px] pl-[3px]">
				<svg style={{ height: "32px", width: "32px", color: "#EAEAEA" }} fill="none" height="32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" viewBox="0 0 24 24" width="32">
					<path d="M16.88 3.549L7.12 20.451"></path>
				</svg>
			</div>
		);
	};

	return (
		<div className="max-h-[50px] flex fdr items-center w-[100%] my-1.5 pl-[20px]">
			<Link href="/medibook">
				<div className="flex fdr items-center justifi-middle">
					<Image className="fill-black grayscale hover:filter-none hidden md:block" src={MediBookLogo} height={16} />
					<Image className="min-w-[33px] grayscale hover:filter-none max-w-[35px] md:hidden" src={MediBookBadge} />
				</div>
			</Link>
			<Separator />
			{!isLoading && !isError && (
				<Fragment>
					<Avatar className="w-[30px] h-[30px] mr-[8px]">
						<AvatarImage src="" />
						<AvatarFallback>BO</AvatarFallback>
					</Avatar>
					<p class="h-[20px] weig text-sm font-medium truncate">Berzan Ozejder</p> <Badge className="ml-[8px] hidden md:block">Delegate</Badge>
				</Fragment>
			)}
			{isLoading && <Skeleton className="h-5 w-[100px] bg-gray-300" />}
			{isError && <Skeleton className="h-5 w-[100px] bg-red-600" />}
			<Separator />
			<div className="w-[64px] h-[30px] max-h-[30px] ">
				<Select>
					<SelectTrigger className="w-[64px] h-[30px] max-h-[30px] border-none">{!isLoading && !isError && data[0]}</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Session</SelectLabel>
							{!isLoading &&
								!isError &&
								data.map((item) => {
									return <SelectItem value={item}>{item}</SelectItem>;
								})}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
