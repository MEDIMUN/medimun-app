"use client";

import Link from "next/link";
import { Button, Spacer, Avatar, TableModal, ModalContent, ModalHeader, ModalBody, Modal, ModalFooter, Table, TableHeader, Input, TableBody, TableColumn, TableRow, TableCell, User, ButtonGroup, Chip, Tooltip, Pagination, useDisclosure } from "@nextui-org/react";
import prisma from "@/prisma/client";
import * as SolarIconSet from "solar-icon-set";
import { prune, toggleDisableUser } from "./user.server.js";
import { useToast } from "@/components/ui/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";
import { updateSearchParams, removeSearchParams } from "@/lib/searchParams";
import { flushSync } from "react-dom";
import { useDebouncedValue } from "@mantine/hooks";
import TopBar from "@/components/medibook/TopBar.jsx";

export default function UsersTable({ users, numberOfUsers, numberOfPages, session }) {
	const { toast } = useToast();
	const searchParams = useSearchParams();
	const router = useRouter();
	const [query, setQuery] = useState(searchParams.get("query") || "");
	const [debounced] = useDebouncedValue(query, 500);
	const [isLoading, setIsLoading] = useState(false);
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

	async function toggleDisableUserHandler(userId) {
		flushSync(() => {
			setIsLoading(true);
		});
		const res = await toggleDisableUser(userId);
		if (res) toast(res);
		if (res?.ok) router.refresh();
		setIsLoading(false);
	}

	async function pruneHandler() {
		flushSync(() => {
			setIsLoading(true);
		});
		const res = await prune(searchParams.get("selected").split(","));
		if (res) toast(res);
		if (res?.ok) router.refresh();
		setIsLoading(false);
		onClose();
	}

	useEffect(() => {
		if (debounced) {
			updateSearchParams(router, { query: debounced, page: 1 });
		} else {
			removeSearchParams(router, { query: "" });
		}
	}, [debounced]);

	const selectedLength = searchParams.get("selected") ? searchParams.get("selected").split(",").length : 0;
	return (
		<>
			<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
				<ModalContent>
					<ModalHeader className="flex flex-col gap-1">Are you sure you want to prune users</ModalHeader>
					<ModalBody>
						<p className="text-black">This action will remove all roles and awards of a user. This action is irreversible.</p>
					</ModalBody>
					<ModalFooter>
						<Button onPress={onClose}>Cancel</Button>
						<Button color="danger" onPress={pruneHandler} isLoading={isLoading}>
							Prune
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
			<TopBar title="Users">
				<Button as={Link} href="?add" className="my-auto ml-auto">
					Add User
				</Button>
			</TopBar>
			<div id="show-scrollbar" className="flex h-[calc(100%-101px)] flex-col overflow-x-auto rounded-2xl border-1 border-gray-200 p-4">
				<Table
					removeWrapper
					isStriped
					selectedKeys={searchParams.get("selected") ? searchParams.get("selected").split(",") : []}
					onSelectionChange={(keys) => {
						const keysArray = [...keys];
						if (keysArray.includes(session.user.id)) return;
						if (keys === "all" || keysArray.length == numberOfUsers || keysArray.length == 0) {
							removeSearchParams(router, { selected: "all" });
							return;
						}
						updateSearchParams(router, { selected: keysArray });
						router.refresh();
					}}
					topContent={
						<div className="flex gap-2">
							<Button
								onPress={() => {
									updateSearchParams(router, { assign: "" });
								}}
								isDisabled={!(selectedLength != 0 && selectedLength < 21)}>
								Assign Roles
							</Button>
							<Button onPress={onOpen} isDisabled={!(selectedLength != 0 && selectedLength < 6)}>
								Remove All Roles
							</Button>
							<Input
								className="w-full rounded-2xl border-1 border-gray-200"
								placeholder="Search by name, email, school, id or username"
								label=""
								isClearable
								onClear={() => {
									removeSearchParams(router, { query: "" });
									setQuery("");
								}}
								labelPlacement="outside"
								value={query}
								onChange={(e) => {
									setQuery(e.target.value);
								}}
							/>
						</div>
					}
					sortDescriptor={{ column: searchParams.get("orderBy") || "officialName", direction: searchParams.get("direction") == "desc" ? "descending" : "ascending" }}
					onSortChange={(descriptor) => {
						removeSearchParams(router, { remove: "" });
						updateSearchParams(router, { orderBy: descriptor.column, direction: descriptor.direction.toLowerCase() == "descending" ? "desc" : "asc" });
					}}
					selectionMode="multiple"
					className="static z-0 mb-auto min-w-max">
					<TableHeader>
						<TableColumn key="officialName" allowsSorting>
							NAMES
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
						<TableColumn>CURRENT ROLE</TableColumn>
						<TableColumn>ACCOUNT STATUS</TableColumn>
						<TableColumn>ACTIONS</TableColumn>
					</TableHeader>
					<TableBody emptyContent={"No Users Found"}>
						{users.map((user, index) => {
							return (
								<TableRow key={user.id}>
									<TableCell>
										<Tooltip className="rounded-2xl p-0 shadow-2xl" isDisabled={!user.profilePicture} closeDelay={0} content={<Avatar className="h-48 w-48 rounded-2xl shadow-2xl" showFallback color="gradient" name={user.officialName[0] + user.officialSurname[0]} src={`/api/users/${user.id}/avatar`} />}>
											<User
												name={user.officialName + " " + user.officialSurname}
												description={user.displayName}
												avatarProps={{
													showFallback: true,
													color: "gradient",
													name: user.officialName[0] + user.officialSurname[0],
													isBordered: true,
													src: `/api/users/${user.id}/avatar`,
												}}
											/>
										</Tooltip>
									</TableCell>
									<TableCell>{user.id}</TableCell>
									<TableCell>
										<p className="text-black">
											{user.username && "@"}
											{user.username || ""}
										</p>
									</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>
										{user.student[0] ? (
											<Link className="text-blue-500" href={`/medibook/schools?view=${user.student ? user.student[0].school.id : ""}&return=/medibook/users`}>
												{user.student[0].school.name} ↗
											</Link>
										) : (
											"No School Selected"
										)}
									</TableCell>
									<TableCell>{}</TableCell>
									<TableCell className="gap-1">
										{user.account && !user.isDisabled ? (
											<Tooltip content={`Last Login: ${user.account.lastLogin.toDateString()}`}>
												<Chip color="success">Active</Chip>
											</Tooltip>
										) : (
											<Tooltip content="This user does not have an account hence they can't login. If they use the current email on record when creating an account the new account will be automatically connected to this user.">
												<Chip color="warning">Standalone</Chip>
											</Tooltip>
										)}
									</TableCell>
									<TableCell>
										{session.user.id !== user.id ? (
											<div className="flex gap-2">
												<Tooltip content={user.isDisabled ? "Enable User" : "Disable User"}>
													<Button color={user.isDisabled ? "danger" : "success"} onPress={() => toggleDisableUserHandler(user.id)} isDisabled={isLoading} isLoading={isLoading} isIconOnly>
														<SolarIconSet.UserCrossRounded iconStyle="Outline" size={24} />
													</Button>
												</Tooltip>
												<Tooltip content="Edit user roles">
													<Button onPress={() => updateSearchParams(router, { remove: user.id })} isDisabled={isLoading} isLoading={isLoading} isIconOnly>
														<SolarIconSet.HamburgerMenu iconStyle="Outline" size={24} />
													</Button>
												</Tooltip>
												<Tooltip content="Edit user data">
													<Button onPress={() => updateSearchParams(router, { edit: user.id })} isDisabled={isLoading} isLoading={isLoading} isIconOnly>
														<SolarIconSet.PenNewSquare iconStyle="Outline" size={24} />
													</Button>
												</Tooltip>
												<Tooltip content="View user data">
													<Button onPress={() => updateSearchParams(router, { view: user.id })} isDisabled={isLoading} isLoading={isLoading} isIconOnly>
														<SolarIconSet.Eye iconStyle="Outline" size={24} />
													</Button>
												</Tooltip>
											</div>
										) : (
											<Button as={Link} href="/medibook/account" className="w-min px-5" startContent={<SolarIconSet.User iconStyle="Outline" size={24} />}>
												Account Settings
											</Button>
										)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
				<Spacer y={4} />
				<div className="flex w-full justify-center">
					<Pagination className="absolute bottom-12" isCompact showControls showShadow color="secondary" page={searchParams.get("page") || 1} total={numberOfPages} onChange={(page) => updateSearchParams(router, { page: page })} />
				</div>
			</div>
		</>
	);
}
