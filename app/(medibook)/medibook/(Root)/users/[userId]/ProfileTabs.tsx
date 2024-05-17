"use client";

import Icon from "@/components/icon";
import { Accordion, AccordionItem, button, Button, Chip, Link, ScrollShadow, Spacer, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip } from "@nextui-org/react";
import { Tabs, Tab } from "@nextui-org/tabs";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getOrdinal } from "@/lib/get-ordinal";

function RoleDisplay({ roles }) {
	return (
		<ul className="grid gap-4">
			{roles.map((role, index) => {
				let roleText, roleUrl, buttonText;
				switch (role.roleIdentifier) {
					case "chair":
						roleText = `Chair of ${role.committee}`;
						buttonText = "View Committee";
						roleUrl = `/medibook/sessions/${role.session}/committees/${role.committeeSlug || role.committeeId}`;
						break;
					case "delegate":
						roleText = `Delegate in ${role.committee}`;
						buttonText = "View Committee";
						roleUrl = `/medibook/sessions/${role.session}/committees/${role.committeeSlug || role.committeeId}`;
						break;
					case "member":
						roleText = `Member of ${role.department}`;
						buttonText = "View Department";
						roleUrl = `/medibook/sessions/${role.session}/departments/${role.departmentSlug || role.departmentId}`;
						break;
					case "manager":
						roleText = `Manager of ${role.department}`;
						buttonText = "View Department";
						roleUrl = `/medibook/sessions/${role.session}/departments/${role.departmentSlug || role.departmentId}`;
						break;
					default:
						return null;
				}

				return (
					<li key={index} className={`mx-auto flex w-full max-w-[700px] flex-col gap-2 rounded-xl border border-black/10 bg-content1/60 p-4 dark:border-white/20 md:flex-row`}>
						<div className="flex flex-col gap-1">
							<div className="mb-[-10px] line-clamp-4 flex flex-col gap-2 bg-gradient-to-br from-foreground-800 to-foreground-500 bg-clip-text text-xl font-semibold tracking-tight text-transparent dark:to-foreground-200">
								<p>{roleText}</p>
							</div>
							<p className="mt-1 line-clamp-2 text-default-400">
								{role?.session}
								<sup>{getOrdinal(role?.session)}</sup> Annual Session
							</p>
						</div>
						<div className="flex flex-col gap-2 md:ml-auto">
							<div className="my-auto flex gap-2">
								<Tooltip content="View Committee">
									<Button endContent={<Icon icon="solar:arrow-right-outline" width={20} />} as={Link} href={roleUrl} fullWidth className="my-auto border-small border-black/10 bg-black/10 shadow-md light:text-black dark:border-white/20 dark:bg-white/10 md:w-full">
										{buttonText}
									</Button>
								</Tooltip>
							</div>
						</div>
					</li>
				);
			})}
		</ul>
	);
}

export function ProfileTabs({ user }) {
	const [selectedTab, setSelectedTab] = useState("about");

	useEffect(() => {
		console.log(window.location.hash);
		const hash = window.location.hash.substring(1);
		const path = hash.split("?")[0];
		setSelectedTab(path || "about");
	}, []);

	return (
		<div className="flex flex-col justify-start overflow-hidden">
			<ScrollShadow hideScrollBar className="flex max-w-full flex-col justify-between gap-8 overflow-x-scroll" orientation="horizontal">
				<Tabs
					selectedKey={selectedTab}
					onSelectionChange={setSelectedTab}
					className="mx-auto"
					aria-label="Navigation Tabs"
					classNames={{
						cursor: "bg-default-200 shadow-none",
						tab: "h-[30px]",
						tabList: "flex gap-0",
					}}
					radius="full"
					variant="light">
					{user.user.bio && <Tab key="about" title="About" />}
					<Tab key="currentRoles" title="Current Roles" />
					<Tab key="pastRoles" title="Past & Future Roles" />
					<Tab key="awards" title="Awards" />
				</Tabs>
			</ScrollShadow>
			<Spacer y={1} />
			<Tabs
				aria-label="Navigation Tabs"
				selectedKey={selectedTab}
				classNames={{
					cursor: "bg-default-200 shadow-none",
					tabList: "hidden",
				}}
				radius="full"
				variant="light">
				<Tab key="about" title="About Me">
					<h2 className="mx-auto max-w-[600px] text-center text-large text-default-500">{user.user.bio}</h2>
				</Tab>

				<Tab key="currentRoles">
					<RoleDisplay roles={user.currentRoles} />
				</Tab>
				<Tab as="ul" key="pastRoles" title="Campaign Team" className="grid gap-4">
					<RoleDisplay roles={user.pastRoles} />
				</Tab>
			</Tabs>
		</div>
	);
}

export default ProfileTabs;
