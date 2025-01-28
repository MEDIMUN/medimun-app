"use client";

import { ChevronRight, Folder, Forward, MoreHorizontal, Trash2, type LucideIcon } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { FastLink } from "./fast-link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

export function SimpleSection({
	items,
	title,
}: {
	title: string;
	items: {
		title: string;
		url: string;
		icon: LucideIcon;
		items?: { title: string; url: string; icon: LucideIcon; isActive?: boolean }[];
	}[];
}) {
	const { isMobile } = useSidebar();

	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden">
			<SidebarGroupLabel>{title}</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item, i) => {
					if (!item.items) {
						return (
							<SidebarMenuItem key={item.url + i}>
								<SidebarMenuButton asChild>
									<FastLink prefetch={true} href={item.url}>
										{item.icon && <item.icon />}
										<span>{item.title}</span>
									</FastLink>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					}

					if (item.items) {
						return (
							<Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
								<SidebarMenuItem>
									<CollapsibleTrigger asChild>
										<SidebarMenuButton tooltip={item.title}>
											{item.icon && <item.icon />}
											<span className="line-clamp-1 block truncate">{item.title}</span>
											<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
										</SidebarMenuButton>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub>
											{item.items?.map((subItem) => {
												if (!subItem.items) {
													return (
														<SidebarMenuSubItem key={subItem.title}>
															<SidebarMenuSubButton asChild>
																<FastLink href={subItem.url}>
																	{subItem.icon && <subItem.icon />}
																	<span>{subItem.title}</span>
																</FastLink>
															</SidebarMenuSubButton>
														</SidebarMenuSubItem>
													);
												} else {
													return (
														<Collapsible key={subItem.title} asChild defaultOpen={subItem.isActive} className="group/collapsible2">
															<SidebarMenuSubItem>
																<CollapsibleTrigger asChild>
																	<SidebarMenuSubButton tooltip={subItem.title}>
																		{subItem.icon && <subItem.icon />}
																		<span className="line-clamp-1 block truncate">{subItem.title}</span>
																		<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible2:rotate-90" />
																	</SidebarMenuSubButton>
																</CollapsibleTrigger>
																<CollapsibleContent>
																	<SidebarMenuSub>
																		{subItem.items?.map((subSubItem) => (
																			<SidebarMenuSubItem key={subSubItem.title}>
																				<SidebarMenuSubButton asChild>
																					<FastLink href={subSubItem.url}>
																						{subSubItem.icon && <subSubItem.icon />}
																						<span>{subSubItem.title}</span>
																					</FastLink>
																				</SidebarMenuSubButton>
																			</SidebarMenuSubItem>
																		))}
																	</SidebarMenuSub>
																</CollapsibleContent>
															</SidebarMenuSubItem>
														</Collapsible>
													);
												}
											})}
										</SidebarMenuSub>
									</CollapsibleContent>
								</SidebarMenuItem>
							</Collapsible>
						);
					}
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}

{
	/* <DropdownMenu>
<DropdownMenuTrigger asChild>
	<SidebarMenuAction showOnHover>
		<MoreHorizontal />
		<span className="sr-only">More</span>
	</SidebarMenuAction>
</DropdownMenuTrigger>
<DropdownMenuContent className="w-48 rounded-lg" side={isMobile ? "bottom" : "right"} align={isMobile ? "end" : "start"}>
	<DropdownMenuItem>
		<Folder className="text-muted-foreground" />
		<span>View Project</span>
	</DropdownMenuItem>
	<DropdownMenuItem>
		<Forward className="text-muted-foreground" />
		<span>Share Project</span>
	</DropdownMenuItem>
	<DropdownMenuSeparator />
	<DropdownMenuItem>
		<Trash2 className="text-muted-foreground" />
		<span>Delete Project</span>
	</DropdownMenuItem>
</DropdownMenuContent>
</DropdownMenu> */
}
