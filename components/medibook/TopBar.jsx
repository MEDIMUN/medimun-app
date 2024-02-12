"use client";

import MediBookLogo from "@public/assets/branding/logos/medibook-logo-white-2.svg";
import MediBookBadge from "@public/assets/branding/badges/medibook-badge-white-1.svg";
import { Input, Button, Tab, Tabs, Chip, AvatarGroup, Link, Tooltip, Divider, Textarea, Spacer, Autocomplete, AutocompleteItem, Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, ScrollShadow, ButtonGroup, Select, SelectSection, SelectItem } from "@nextui-org/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import * as SolarIconSet from "solar-icon-set";
import Image from "next/image";
import { SidebarContext } from "@/app/(medibook)/providers";
import { Icon } from "@iconify/react";
import NotificationsCard from "@/nextuipro/notifications-card";
import { Navbar, NavbarBrand, NavbarContent, Popover, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, PopoverContent, PopoverTrigger, Badge, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import { useSession } from "next-auth/react";

export function TopBar(props) {
	let { isHidden, setIsHidden, setIsDark, isDark } = useContext(SidebarContext);
	const { data: session, status } = useSession();
	return (
		<>
			<Navbar
				isBordered
				classNames={{
					item: "data-[active=true]:text-primary",
					wrapper: "px-4 sm:px-6",
				}}
				maxWidth="full"
				height="64px">
				<NavbarBrand>
					<Button isIconOnly size="sm" variant="light" onPress={() => setIsHidden(!isHidden)}>
						<Icon className="text-default-500" height={24} icon="solar:sidebar-minimalistic-outline" width={24} />
					</Button>
					{isHidden && (
						<>
							<Image alt="MediBook Logo" className="ml-2 hidden fill-black hover:filter-none md:block" src={MediBookLogo} height={16} />
							<Image alt="MediBook Logo" className="ml-2 block fill-black hover:filter-none md:hidden" src={MediBookBadge} height={16} />
						</>
					)}
				</NavbarBrand>
				<Breadcrumbs className="hidden sm:flex" radius="full">
					<BreadcrumbItem>Apps</BreadcrumbItem>
					<BreadcrumbItem>iOS App</BreadcrumbItem>
					<BreadcrumbItem>TestFlight</BreadcrumbItem>
				</Breadcrumbs>

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
						<Button onPress={() => setIsDark(!isDark)} isIconOnly radius="full" variant="light">
							<Icon className="text-default-500" icon="solar:sun-linear" width={24} />
						</Button>
					</NavbarItem>
					{/* Settings */}
					<NavbarItem className="hidden lg:flex">
						<Button isIconOnly radius="full" variant="light">
							<Icon className="text-default-500" icon="solar:settings-linear" width={24} />
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
								<DropdownItem key="analytics">Analytics</DropdownItem>
								<DropdownItem key="system">System</DropdownItem>
								<DropdownItem key="configurations">Configurations</DropdownItem>
								<DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
								<DropdownItem key="logout" color="danger">
									Log Out
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</NavbarItem>
				</NavbarContent>

				{/* Mobile Menu */}
			</Navbar>
			<Spacer y={6} />
			<div className="w-full px-4 lg:px-8">
				<header className="mb-6 flex w-full items-center justify-between">
					<div className="flex flex-col">
						<h1 className="text-xl font-bold text-default-900 lg:text-3xl">{props.title}</h1>
						<p className="text-small text-default-400 lg:text-medium">{props.description}</p>
					</div>
					{props.children}
				</header>
			</div>
			<Spacer y={4} />
		</>
	);
}
