"use client";
import { Input, Button, Textarea, Autocomplete, AutocompleteItem, Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, ScrollShadow, ButtonGroup, Select, SelectSection, SelectItem } from "@nextui-org/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addUser } from "./add-user.server";
import { countries } from "@/data/countries";
import { flushSync } from "react-dom";
import Link from "next/link";
import { removeSearchParams } from "@/lib/searchParams";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@nextui-org/table";

export default function Component({ view }) {
	const { data: session, status } = useSession();
	const searchParams = useSearchParams();
	const router = useRouter();
	console.log(view);
	return (
		<Modal className="z-[10000]" size="3xl" isOpen={status === "authenticated" && searchParams.has("view") && authorize(session, [s.management])} onOpenChange={() => removeSearchParams({ view: "" }, router)}>
			<ModalContent>
				<ModalHeader>Details of {view?.officialName}</ModalHeader>
				<ModalBody>
					<Table isStriped removeWrapper hideHeader>
						<TableHeader>
							<TableColumn>KEY</TableColumn>
							<TableColumn>DATA</TableColumn>
						</TableHeader>
						<TableBody>
							<TableRow key="id">
								<TableCell>ID</TableCell>
								<TableCell>{view?.id}</TableCell>
							</TableRow>
							<TableRow key="email">
								<TableCell>Email</TableCell>
								<TableCell>{view?.email}</TableCell>
							</TableRow>
							<TableRow key="officialName">
								<TableCell>Name</TableCell>
								<TableCell>{view?.officialName}</TableCell>
							</TableRow>
							<TableRow key="officialSurname">
								<TableCell>Surname</TableCell>
								<TableCell>{view?.officialSurname}</TableCell>
							</TableRow>
							<TableRow key="displayName">
								<TableCell>Display Name</TableCell>
								<TableCell>{view?.displayName}</TableCell>
							</TableRow>
							<TableRow key="phoneNumber">
								<TableCell>Phone</TableCell>
								<TableCell className="truncate">{view?.phoneNumber && <>{"+" + countries.find((c) => c.countryCode == view.phoneCode)?.countryCallingCode + " " + view?.phoneNumber}</>}</TableCell>
							</TableRow>
							<TableRow key="dateOfBirth">
								<TableCell>Date of Birth</TableCell>
								<TableCell>{view?.dateOfBirth?.toISOString().substring(0, 10)}</TableCell>
							</TableRow>
							<TableRow key="isProfilePrivate">
								<TableCell>Profile Privacy</TableCell>
								<TableCell>{view?.isProfilePrivate ? "Private" : "Public"}</TableCell>
							</TableRow>
							<TableRow key="allowProfilePictureUpdate">
								<TableCell>Update Profile Picture Permission</TableCell>
								<TableCell>{view?.allowProfilePictureUpdate ? "Yes" : "No"}</TableCell>
							</TableRow>
							<TableRow key="allowBioUpdate">
								<TableCell>Update Biography Permission</TableCell>
								<TableCell>{view?.allowBioUpdate ? "Yes" : "No"}</TableCell>
							</TableRow>
							<TableRow key="bio">
								<TableCell>Biography</TableCell>
								<TableCell>{view?.bio}</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</ModalBody>
				<ModalFooter>
					<Button color="danger" variant="light" onPress={() => removeSearchParams({ view: "" }, router)}>
						Close
					</Button>
					<Button color="primary" href={`/medibook/users?edit=${view?.id || ""}`} as={Link}>
						Edit
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
