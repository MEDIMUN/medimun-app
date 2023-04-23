"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { useSession } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

import { signOut } from "next-auth/react";

export default function AvatarMenu() {
	const { data: session, status } = useSession();
	const router = useRouter();
	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Avatar className="w-[30px] h-[30px]">
					{status === "loading" ? <Skeleton /> : <AvatarImage src="" />}
					<AvatarFallback className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">{status === "authenticated" ? session.user.officialName[0] + session.user.officialSurname[0] : ""}</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			{status === "authenticated" && (
				<DropdownMenuContent className="p-5 mr-[24px] mt-1">
					<DropdownMenuLabel className="py-0 font-bold">{session.user.officialName + " " + session.user.officialSurname}</DropdownMenuLabel>
					<DropdownMenuLabel className="py-0 text-gray-500">{session.user.email}</DropdownMenuLabel>
					<DropdownMenuSeparator className="bg-gray-300 mb-2 mt-3" />
					<DropdownMenuItem>Account Settings</DropdownMenuItem>
					<DropdownMenuItem>Dashboard</DropdownMenuItem>
					<DropdownMenuItem>My Team</DropdownMenuItem>
					<DropdownMenuSeparator className="bg-gray-300 mb-3 mt-2" />
					<DropdownMenuItem>
						Command Menu
						<kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
							<span className="text-xs">⌘</span>
						</kbd>
						<kbd className="ml-1 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
							<span className="text-xs">K</span>
						</kbd>
					</DropdownMenuItem>
					<DropdownMenuSeparator className="bg-gray-300 mb-2 mt-3" />
					<DropdownMenuItem onClick={() => router.push("/home")}>View Homepage</DropdownMenuItem>
					<DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>Log Out</DropdownMenuItem>
				</DropdownMenuContent>
			)}
		</DropdownMenu>
	);
}
