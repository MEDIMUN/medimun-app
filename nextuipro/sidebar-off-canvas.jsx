"use client";

import React, { useContext } from "react";
import { Avatar, Button, Modal, ModalBody, ModalContent, ScrollShadow, Spacer, useDisclosure } from "@nextui-org/react";
import { Icon } from "@iconify/react";

import { sectionItemsWithTeams } from "./sidebar-items";

import Sidebar from "./sidebar";
import { SidebarContext } from "@/app/(medibook)/providers";

/**
 * 💡 TIP: You can use the usePathname hook from Next.js App Router to get the current pathname
 * and use it as the active key for the Sidebar component.
 *
 * ```tsx
 * import {usePathname} from "next/navigation";
 *
 * const pathname = usePathname();
 * const currentPath = pathname.split("/")?.[1]
 *
 * <Sidebar defaultSelectedKey="home" selectedKeys={[currentPath]} />
 * ```
 */
export default function Component() {
	let { isHidden, setIsHidden } = useContext(SidebarContext);

	return (
		<Modal
			classNames={{
				base: "justify-start m-0 sm:m-0 p-0 h-dvh max-h-full",
				wrapper: "sm:items-start sm:justify-start max-w-[210px]",
				body: "p-0",
				closeButton: "z-50",
			}}
			isOpen={true}
			motionProps={{
				variants: {
					enter: {
						x: 0,
						transition: {
							duration: 0.3,
							ease: "easeOut",
						},
					},
					exit: {
						x: -288,
						transition: {
							duration: 0.2,
							ease: "easeOut",
						},
					},
				},
			}}
			radius="none"
			scrollBehavior="inside"
			onOpenChange={setIsHidden}>
			<ModalContent>
				<ModalBody>
					<div className="relative flex h-full w-72 flex-1 flex-col p-6">
						<div className="flex items-center gap-2 px-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground"></div>
							<span className="text-small font-bold uppercase text-foreground">Acme</span>
						</div>
						<Spacer y={8} />
						<div className="flex items-center gap-3 px-3">
							<Avatar isBordered size="sm" src="https://i.pravatar.cc/150?u=a04258114e29026708c" />
							<div className="flex flex-col">
								<p className="text-small font-medium text-default-600">John Doe</p>
								<p className="text-tiny text-default-400">Product Designer</p>
							</div>
						</div>

						<ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
							<Sidebar defaultSelectedKey="home" items={sectionItemsWithTeams} />
						</ScrollShadow>

						<Spacer y={8} />
						<div className="mt-auto flex flex-col">
							<Button fullWidth className="justify-start text-default-500 data-[hover=true]:text-foreground" startContent={<Icon className="text-default-500" icon="solar:info-circle-line-duotone" width={24} />} variant="light">
								Help & Information
							</Button>
							<Button className="justify-start text-default-500 data-[hover=true]:text-foreground" startContent={<Icon className="rotate-180 text-default-500" icon="solar:minus-circle-line-duotone" width={24} />} variant="light">
								Log Out
							</Button>
						</div>
					</div>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
