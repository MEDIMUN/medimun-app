"use client";

import MediBookLogo from "@/public/assets/branding/logos/medibook-logo-white-2.svg";
import MediBookBadge from "@/public/assets/branding/badges/medibook-badge-white-1.svg";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useContext, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import * as SolarIconSet from "solar-icon-set";
import Image from "next/image";
import { SidebarContext } from "@/app/(medibook)/providers";
import { Icon } from "@iconify/react";
import NotificationsCard from "@/nextuipro/notifications-card";
import { Avatar, Link, Button, Navbar, NavbarBrand, NavbarContent, Popover, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, PopoverContent, PopoverTrigger, Badge, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import { signOut, useSession } from "next-auth/react";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useTheme } from "next-themes";

export function NavbarWithToggle() {
	let { isHidden, setIsHidden } = useContext(SidebarContext);
	const { data: session, status } = useSession();
	const { theme, setTheme } = useTheme();

	function handleThemeChange() {
		setTheme(theme === "dark" ? "light" : "dark");
	}

	return (
		<Navbar
			classNames={{
				item: "data-[active=true]:text-primary",
				wrapper: "px-4 sm:px-6",
			}}
			className="bg-content2 pl-10"
			maxWidth="full"
			height="64px">
			<NavbarBrand>
				<Button className="block md:hidden" isIconOnly size="sm" variant="light" onPress={() => setIsHidden(!isHidden)}>
					<Icon className="text-default-500" height={24} icon="solar:sidebar-minimalistic-outline" width={24} />
				</Button>
				{isHidden && <Image alt="MediBook Logo" className="ml-2 fill-black hover:filter-none" src={MediBookLogo} height={16} />}
			</NavbarBrand>
			{/* Right Menu */}
			<NavbarContent className="ml-auto h-12 max-w-fit items-center gap-0" justify="end">
				{/* Mobile search */}
				<NavbarItem className="lg:hidden">
					<Button isIconOnly radius="full" variant="light">
						<Icon className="text-default-500" icon="solar:magnifer-linear" width={20} />
					</Button>
				</NavbarItem>
				{/* Theme change */}
				<NavbarItem className="hidden lg:flex">
					<Button onPress={handleThemeChange} isIconOnly radius="full" variant="light">
						<Icon className="text-default-500" icon="solar:sun-linear" width={24} />
					</Button>
				</NavbarItem>
				{/* Notifications */}
				<NavbarItem className="flex">
					<Popover offset={12} placement="bottom-end">
						<PopoverTrigger>
							<Button disableRipple isIconOnly className="overflow-visible" radius="full" variant="light">
								<Badge color="danger" content="5" showOutline={false} size="md">
									<Icon className="text-default-500" icon="solar:bell-linear" width={22} />
								</Badge>
							</Button>
						</PopoverTrigger>
						<PopoverContent className="max-w-[90vw] p-0 sm:max-w-[380px]">
							<NotificationsCard className="w-full shadow-none" />
						</PopoverContent>
					</Popover>
				</NavbarItem>
				{/* User Menu */}
				<NavbarItem className="px-2">
					<Suspense fallback={<Avatar showFallback size="sm" />}>
						<Dropdown placement="bottom-end">
							<DropdownTrigger>
								<button className="mt-1 h-8 w-8 transition-transform">
									<Badge color="success" content="" placement="bottom-right" shape="circle">
										<Avatar showFallback size="sm" src={`/api/users/${session?.user?.id}/avatar`} />
									</Badge>
								</button>
							</DropdownTrigger>
							<DropdownMenu aria-label="Profile Actions" variant="flat">
								<DropdownItem key="profile" className="h-14 gap-2">
									<p className="font-light">Signed in as</p>
									<p className="font-semibold">{session?.user?.email}</p>
								</DropdownItem>
								<DropdownItem as={Link} key="settings">
									My Settings
								</DropdownItem>
								<DropdownItem key="team_settings">Team Settings</DropdownItem>
								<DropdownItem key="system">System</DropdownItem>
								<DropdownItem key="configurations">Configurations</DropdownItem>
								<DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
								<DropdownItem onPress={signOut} key="logout" color="danger">
									Log Out
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</Suspense>
				</NavbarItem>
			</NavbarContent>
		</Navbar>
	);
}
