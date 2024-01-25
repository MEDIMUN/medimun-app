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

export default function TopBar(props) {
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
							<Image alt="MediBook Badge" className="min-w-[33px] max-w-[35px] grayscale hover:filter-none md:hidden" src={MediBookLogo} />
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
