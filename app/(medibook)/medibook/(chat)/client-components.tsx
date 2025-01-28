"use client";

import { Badge } from "@/components/badge";
import { Sidebar, SidebarItem, SidebarLabel, SidebarSection } from "@/components/sidebar";
import { Avatar, AvatarGroup } from "@heroui/avatar";
import { usePathname } from "next/navigation";

export function MessageSidebar({ groupsOfUser, authSession }) {
	const pathname = usePathname();
	return (
		<Sidebar>
			<SidebarSection>
				{groupsOfUser.map((group) => {
					if (group.users.length == 2) {
						const otherUser = group.users.find((user) => user.id != authSession.user.id);
						return (
							<SidebarItem
								current={pathname == `/medibook/messenger/@${otherUser.username || otherUser.id}`}
								key={group.id}
								href={`/medibook/messenger/@${otherUser.username || otherUser.id}?new=true`}
								title={otherUser.displayName}>
								<Avatar showFallback className="w-8 h-8 rounded-md" src={`/api/users/${otherUser.id}/avatar`} size="md" radius="sm" />
								<SidebarLabel>
									{otherUser.officialName} {otherUser.officialSurname}
								</SidebarLabel>
								<Badge className="ml-auto !rounded-full">1</Badge>
							</SidebarItem>
						);
					}
					if (group.users.length > 2) {
						return (
							<SidebarItem
								current={pathname == `/medibook/messenger/${group.id}`}
								key={group.id}
								href={`/medibook/messenger/${group.id}?new=true`}
								title={group.name || "Group"}>
								<AvatarGroup>
									{group.users.map((user) => (
										<Avatar
											classNames={{ base: "max-w-8 max-h-8 rounded-full" }}
											key={user.id}
											showFallback
											src={`/api/users/${user.id}/avatar`}
											size="sm"
											radius="sm"
										/>
									))}
								</AvatarGroup>
								<SidebarLabel>{group.name || "Group"}</SidebarLabel>
								{/* 								<Badge className="ml-auto !rounded-full">1</Badge>
								 */}
							</SidebarItem>
						);
					}
				})}
			</SidebarSection>
		</Sidebar>
	);
}
