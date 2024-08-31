"use client";

import React from "react";
import { Avatar } from "@nextui-org/avatar";
import { Button } from "@nextui-org/button";
import { Icon } from "@iconify/react";

import { cn } from "@/lib/cn";
import Link from "next/link";

export type TeamMember = {
	name: string;
	role: string;
	bio?: string;
	userID: string;
	userSlug?: string;
};

export type TeamMemberCardProps = React.HTMLAttributes<HTMLDivElement> & TeamMember;

const TeamMemberCard = React.forwardRef<HTMLDivElement, TeamMemberCardProps>(({ member, className, ...props }, ref) => (
	<div ref={ref} className={cn("items-left flex flex-col bg-content1/50 px-4 py-4 text-left", className)} {...props}>
		<Avatar
			showFallback
			className="mask mask-squircle h-14 w-14 animate-appearance-in rounded-none shadow-sm"
			src={`/api/users/${member.id}/avatar`}
		/>
		<h3 className="mt-2 font-medium">{member.name}</h3>
		<span className="mb-3 truncate text-sm text-default-500">{member.role}</span>
		{member.bio && <p className=" mb-3 mt-2 text-default-600">{member.bio}</p>}
		<Button as={Link} href={`/medibook/users/${member.username || member.id}`} className="mt-auto w-full bg-content2/60 shadow-sm">
			View Profile
		</Button>
	</div>
));

TeamMemberCard.displayName = "TeamMemberCard";

export default TeamMemberCard;
