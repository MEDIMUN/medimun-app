"use client";

import Link from "next/link";
import { Button, Link as NextUiLink, Spacer, Avatar, TableModal, ModalContent, ModalHeader, ModalBody, Modal, ModalFooter, Table, TableHeader, Input, TableBody, TableColumn, TableRow, TableCell, User, ButtonGroup, Chip, Tooltip, Pagination, useDisclosure } from "@nextui-org/react";
import { toggleDisableUser } from "./user.server.js";
import { useToast } from "@/components/ui/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";
import { updateSearchParams, removeSearchParams } from "@/lib/searchParams";
import { flushSync } from "react-dom";
import { useDebouncedValue } from "@mantine/hooks";
import { Icon } from "@iconify/react";
import Paginator from "@/components/Paginator";

export default function UsersTable({ users, numberOfUsers, numberOfPages, session }) {
	const { toast } = useToast();
	const searchParams = useSearchParams();
	const router = useRouter();
	const [query, setQuery] = useState(searchParams.get("query") || "");
	const [debounced] = useDebouncedValue(query, 500);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedKeys, setSelectedKeys] = useState([]);
	const [debouncedSelectedKeys] = useDebouncedValue(selectedKeys, 500);

	async function toggleDisableUserHandler(userId) {
		flushSync(() => {
			setIsLoading(true);
		});
		const res = await toggleDisableUser(userId);
		if (res) toast(res);
		if (res?.ok) router.refresh();
		setIsLoading(false);
	}

	useEffect(() => {
		if (debounced) {
			updateSearchParams({ query: debounced }, router);
		} else {
			removeSearchParams({ query: "" }, router);
		}
	}, [debounced]);

	useEffect(() => {
		if (!!debouncedSelectedKeys.length) {
			updateSearchParams({ selected: debouncedSelectedKeys }, router);
		} else {
			removeSearchParams({ selected: "" }, router);
		}
	}, [debouncedSelectedKeys]);

	const selectedLength = selectedKeys.length;
	return (
		<>
			<Table
				removeWrapper
				selectedKeys={selectedKeys /* searchParams.get("selected") ? searchParams.get("selected").split(",") : [] */}
				onSelectionChange={(keys) => {
					const keysArray = [...keys];
					if (keysArray.includes(session.user.id)) return;
					if (keys === "all" || keysArray.length == numberOfUsers || keysArray.length == 0) return setSelectedKeys([]);
					setSelectedKeys(keysArray);
				}}
				topContent={<div className="flex gap-2"></div>}
				sortDescriptor={{ column: searchParams.get("orderBy") || "officialName", direction: searchParams.get("direction") == "desc" ? "descending" : "ascending" }}
				onSortChange={(descriptor) => {
					removeSearchParams({ remove: "" }, router);
					updateSearchParams({ orderBy: descriptor.column, direction: descriptor.direction.toLowerCase() == "descending" ? "desc" : "asc" }, router);
				}}
				selectionMode="multiple"
				className="static z-0 mb-auto min-w-max">
				<TableHeader>
					<TableColumn key="officialName" allowsSorting>
						USER
					</TableColumn>
					<TableColumn allowsSorting key="id">
						ID
					</TableColumn>
					<TableColumn allowsSorting key="username">
						USERNAME
					</TableColumn>
					<TableColumn key="email" allowsSorting>
						EMAIL
					</TableColumn>
					<TableColumn>SCHOOL</TableColumn>
					<TableColumn>STATUS</TableColumn>
					<TableColumn />
				</TableHeader>
				<TableBody emptyContent={"No Users Found"}>
					{users.map((user, index) => {
						let { id, officialName, officialSurname, username, email, displayName, isDisabled, account, profilePicture } = user;
						const schoolName = user?.student?.school?.name;
						const fullName = officialName + " " + officialSurname;
						return (
							<TableRow key={id}>
								<TableCell>
									<Tooltip isDisabled={!profilePicture} className="rounded-2xl p-0 shadow-2xl" closeDelay={0} content={<Avatar className="h-48 w-48 rounded-2xl shadow-2xl" showFallback color="gradient" name={user.officialName[0] + user.officialSurname[0]} src={`/api/users/${user.id}/avatar`} />}>
										<User
											name={fullName}
											description={displayName}
											avatarProps={{
												size: "sm",
												showFallback: true,
												name: "",
												color: "primary",
												src: `/api/users/${id}/avatar`,
											}}
										/>
									</Tooltip>
								</TableCell>
								<TableCell>{id}</TableCell>
								<TableCell>{username}</TableCell>
								<TableCell>{email}</TableCell>
								<TableCell>{schoolName}</TableCell>
								<TableCell className="space-x-2">
									{account && !isDisabled && (
										<Chip size="sm" variant="flat" color="success">
											Active
										</Chip>
									)}
									{!account && !isDisabled && (
										<Chip size="sm" variant="flat" color="warning">
											Standalone
										</Chip>
									)}
									{isDisabled && (
										<Chip size="sm" variant="flat" color="danger">
											Disabled
										</Chip>
									)}
								</TableCell>
								<TableCell className="space-x-2">
									{session.user.id !== id ? (
										<>
											<Tooltip content={isDisabled ? "Enable User" : "Disable User"}>
												<Button variant="flat" onPress={() => toggleDisableUserHandler(id)} isDisabled={isLoading} isLoading={isLoading} isIconOnly>
													{!isDisabled ? <Icon icon="solar:user-check-rounded-bold-duotone" width={24} color="green" /> : <Icon icon="solar:user-block-rounded-bold-duotone" color="red" width={24} />}
												</Button>
											</Tooltip>
											<Tooltip content="Edit user roles">
												<Button variant="flat" onPress={() => updateSearchParams({ remove: id }, router)} isIconOnly>
													<Icon color="orange" icon="solar:bag-cross-bold-duotone" width={24} />
												</Button>
											</Tooltip>
											<Tooltip content="Edit user data">
												<Button variant="flat" onPress={() => updateSearchParams({ edit: id }, router)} isIconOnly>
													<Icon icon="solar:pen-bold-duotone" color="#ff5900" width={24} />
												</Button>
											</Tooltip>
											<Tooltip content="View user data">
												<Button variant="flat" onPress={() => updateSearchParams({ view: id }, router)} isIconOnly>
													<Icon icon="solar:eye-bold-duotone" color="gray" width={24} />
												</Button>
											</Tooltip>
										</>
									) : (
										<>
											<Button variant="flat" as={Link} href="/medibook/account" isIconOnly>
												<Icon icon="solar:settings-bold-duotone" color="gray" width={24} />
											</Button>
											<Tooltip content="View user data">
												<Button variant="flat" onPress={() => updateSearchParams({ view: id }, router)} isIconOnly>
													<Icon icon="solar:eye-bold-duotone" color="gray" width={24} />
												</Button>
											</Tooltip>
										</>
									)}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
			<Paginator page={searchParams.get("page") || 1} total={numberOfPages} />
		</>
	);
}
