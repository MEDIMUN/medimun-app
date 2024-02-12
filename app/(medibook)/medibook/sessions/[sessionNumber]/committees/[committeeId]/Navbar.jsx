"use client";

import { Button, Link, ScrollShadow, Tabs, Tab, Chip, AvatarGroup, Avatar, Tooltip, Divider } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Component({ params }) {
	const [activeTab, setActiveTab] = useState("overview");
	const router = useRouter();

	useEffect(() => {
		const keyHrefMap = {
			overview: `/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}`,
			announcements: `/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}/announcements`,
			resolutions: `/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}/resolutions`,
			delegates: `/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}/delegates`,
			topics: `/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}/topics`,
			resources: `/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}/resources`,
		};
		router.push(keyHrefMap[activeTab]);
	}, [activeTab]);

	return (
		<ScrollShadow hideScrollBar className="-mx-2 flex w-full justify-between gap-8 px-4 sm:px-6" orientation="horizontal">
			<Tabs
				onSelectionChange={(selected) => setActiveTab(selected)}
				selectedKey={activeTab}
				aria-label="Navigation Tabs"
				classNames={{
					cursor: "bg-default-200 shadow-none",
				}}
				radius="full"
				variant="light">
				<Tab key="overview" title="Overview" />
				<Tab
					key="announcements"
					title={
						<div className="flex items-center gap-2">
							<p>Announcements</p>
							<Chip size="sm">9</Chip>
						</div>
					}
				/>
				<Tab key="resolutions" title="Resolutions" />
				<Tab key="delegates" title="Delegates" />
				<Tab key="topics" title="Topics" />
				<Tab key="resources" title="Resources" />
			</Tabs>
			<div className="flex items-center gap-4">
				<AvatarGroup max={3} size="sm" total={10}>
					<Tooltip content="John" placement="bottom">
						<Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
					</Tooltip>
					<Tooltip content="Mark" placement="bottom">
						<Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
					</Tooltip>
					<Tooltip content="Jane" placement="bottom">
						<Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
					</Tooltip>
				</AvatarGroup>
				<Divider className="h-6" orientation="vertical" />
				<Tooltip content="New deployment" placement="bottom">
					<Button isIconOnly radius="full" size="sm" variant="faded">
						<Icon className="text-default-500" icon="lucide:plus" width={16} />
					</Button>
				</Tooltip>
			</div>
		</ScrollShadow>
	);
}
