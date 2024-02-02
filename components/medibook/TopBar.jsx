"use client";

import MediBookLogo from "@public/assets/branding/logos/medibook-logo-white-2.svg";
import MediBookBadge from "@public/assets/branding/badges/medibook-badge-white-1.svg";
import { Input, Button, Textarea, Spacer, Autocomplete, AutocompleteItem, Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, ScrollShadow, ButtonGroup, Select, SelectSection, SelectItem } from "@nextui-org/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import Link from "next/link";
import * as SolarIconSet from "solar-icon-set";
import Image from "next/image";
import { SidebarContext } from "@/app/(medibook)/providers";

export function TopBar(props) {
	let { isHidden, setIsHidden } = useContext(SidebarContext);
	return (
		<>
			<div className="flex w-full rounded-2xl border-1 border-gray-200 p-4 align-middle duration-300 hover:shadow-md">
				<div className="flex flex-row">
					<Button className="" isIconOnly onPress={() => setIsHidden(!isHidden)}>
						<SolarIconSet.HamburgerMenu iconStyle="Outline" size={24} />
					</Button>
					{isHidden && (
						<>
							<Image alt="MediBook Logo" className="ml-4 hidden fill-black hover:filter-none md:block" src={MediBookBadge} height={16} />
						</>
					)}
					<p className="text-md my-auto ml-4 text-lg">{props.title}</p>
				</div>
				<div className="ml-auto flex flex-row">{props.children}</div>
			</div>
			<Spacer y={4} />
		</>
	);
}

export function Frame(props) {
	return (
		<div className={`h-[calc(100%-91px)] overflow-y-auto rounded-2xl border-1 border-gray-200 font-[montserrat] ${!props.noPadding && "p-4"}`}>
			{props.isGrid && <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">{props.children}</div>}
			{!props.isGrid && props.children}
			{props.isEmpty && (
				<div className="flex h-full justify-center align-middle">
					<p className="m-auto my-auto w-full text-center">{props.emptyContent}</p>
				</div>
			)}
		</div>
	);
}
