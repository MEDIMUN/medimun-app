"use client";

import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Spacer } from "@nextui-org/spacer";
import { Tooltip } from "@nextui-org/tooltip";
import { Tabs, Tab } from "@nextui-org/tabs";
import { useEffect, useState } from "react";
import { getOrdinal } from "@/lib/ordinal";
import { Button } from "@/components/button";

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
					case "secretaryGeneral":
						roleText = `Secretary-General of the ${role.session}${getOrdinal(role.session)} Annual Session`;
						buttonText = "View Session";
						roleUrl = `/medibook/sessions/${role.session}`;
						break;
					case "deputySecretaryGeneral":
						roleText = `Deputy Secretary-General of the ${role.session}${getOrdinal(role.session)} Annual Session`;
						buttonText = "View Session";
						roleUrl = `/medibook/sessions/${role.session}`;
						break;
					case "presidentOfTheGeneralAssembly":
						roleText = `President of the General Assembly of the ${role.session}${getOrdinal(role.session)} Annual Session`;
						buttonText = "View Session";
						roleUrl = `/medibook/sessions/${role.session}`;
						break;
					case "deputyPresidentOfTheGeneralAssembly":
						roleText = `Vice President of the General Assembly of the ${role.session}${getOrdinal(role.session)} Annual Session`;
						buttonText = "View Session";
						roleUrl = `/medibook/sessions/${role.session}`;
						break;
					case "schoolDirector":
						roleText = `School Director of ${role.school}`;
						buttonText = "View School";
						roleUrl = `/medibook/schools/${role.schoolSlug || role.schoolId}`;
						break;
					case "seniorDirector":
						roleText = `Senior Director of MEDIMUN`;

						break;
					default:
						return null;
				}

				return (
					<li
						key={index}
						className={`mx-auto flex w-full max-w-[700px] flex-col gap-2 rounded-xl border border-black/10 bg-content1/60 p-4 dark:border-white/20 md:flex-col`}>
						<div className="flex flex-col gap-1">
							<div className="mb-[-10px] line-clamp-4 flex flex-col gap-2 bg-gradient-to-br from-foreground-800 to-foreground-500 bg-clip-text text-xl font-semibold tracking-tight text-transparent dark:to-foreground-200">
								<p>{roleText}</p>
							</div>
							{role.session ? (
								<p className="mt-1 line-clamp-2 text-default-400">
									{role?.session}
									<sup>{getOrdinal(role?.session)}</sup> Annual Session
								</p>
							) : (
								<p className="mt-1 line-clamp-2 text-default-400">All Sessions</p>
							)}
						</div>
						{roleUrl && (
							<div className="flex flex-col gap-2">
								<div className="my-auto flex gap-2">
									<Button
										href={roleUrl}
										className="my-auto w-full border-small border-black/10 bg-black/10 shadow-md light:text-black dark:border-white/20 dark:bg-white/10 ">
										{buttonText}
									</Button>
								</div>
							</div>
						)}
					</li>
				);
			})}
		</ul>
	);
}

export function ProfileTabs({ user }) {
	const [selectedTab, setSelectedTab] = useState("currentRoles");

	useEffect(() => {
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
