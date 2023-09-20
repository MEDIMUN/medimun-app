"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useSession } from "next-auth/react";

import { Skeleton } from "@/components/ui/skeleton";

import { signOut } from "next-auth/react";
import Link from "next/link";

export default function AvatarMenu() {
	const { data: session, status } = useSession();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Avatar className="h-[30px] w-[30px]">
					{status === "loading" ? <Skeleton /> : <AvatarImage className="object-cover" src={`/api/user/${status === "authenticated" && session.user.id}/profilePicture`} />}
					<AvatarFallback className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
						{status === "authenticated" ? session.user.officialName[0] + session.user.officialSurname[0] : ""}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			{status === "authenticated" && (
				<DropdownMenuContent className="mr-[24px] mt-1 p-5">
					<DropdownMenuLabel className="py-0 font-bold">{session.user.officialName + " " + session.user.officialSurname}</DropdownMenuLabel>
					<DropdownMenuLabel className="py-0 text-gray-500">{session.user.email}</DropdownMenuLabel>
					<DropdownMenuLabel className="py-0 text-gray-500">{session.currentRoleNames[0] || (session.pastRoleNames.length == 0 ? "Applicant" : "Alumni")}</DropdownMenuLabel>
					<DropdownMenuSeparator className="mb-2 mt-3 bg-gray-300" />
					<Link href="/medibook/account">
						<DropdownMenuItem>Account Settings</DropdownMenuItem>
					</Link>
					<Link href="/medibook/certificates">
						<DropdownMenuItem>Certificates & Awards</DropdownMenuItem>
					</Link>
					<Link href="/medibook">
						<DropdownMenuItem>Dashboard</DropdownMenuItem>
					</Link>
					<DropdownMenuItem>My Team</DropdownMenuItem>
					<DropdownMenuSeparator className="mb-3 mt-2 bg-gray-300" />
					<DropdownMenuItem>
						Command Menu
						<kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
							<span className="text-xs">⌘</span>
						</kbd>
						<kbd className="pointer-events-none ml-1 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
							<span className="text-xs">K</span>
						</kbd>
					</DropdownMenuItem>
					<DropdownMenuSeparator className="mb-2 mt-3 bg-gray-300" />
					<Link href="/home">
						<DropdownMenuItem>View Homepage</DropdownMenuItem>
					</Link>
					<DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>Log Out</DropdownMenuItem>
				</DropdownMenuContent>
			)}
		</DropdownMenu>
	);
}
