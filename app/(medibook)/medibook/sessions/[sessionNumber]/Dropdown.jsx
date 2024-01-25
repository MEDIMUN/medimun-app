"use client";

import Link from "next/link";
import { Dropdown as Dropdown2, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem } from "@nextui-org/dropdown";
import { Button } from "@nextui-org/button";
import { authorize, s } from "@/lib/authorize";
import { cn } from "@/lib/utils";

export default function Dropdown(props) {
	const session = props.session;
	if (!authorize(session, [s.management])) return;
	return (
		<Dropdown2 disableAnimation className={props.className}>
			<DropdownTrigger>
				<Button variant="light">Actions</Button>
			</DropdownTrigger>
			<DropdownMenu>
				{authorize(session, [s.sd, s.admins, s.director]) && (
					<DropdownItem href="?edit" as={Link} key="editSession">
						Edit Session
					</DropdownItem>
				)}
				<DropdownItem href="?add=committee" as={Link} key="addCommittee">
					Add Committee
				</DropdownItem>
				<DropdownItem href="?add=department" as={Link} key="addDepartment">
					Add Department
				</DropdownItem>
			</DropdownMenu>
		</Dropdown2>
	);
}
