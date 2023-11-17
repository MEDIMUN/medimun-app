"use client";

import { NextUIProvider } from "@nextui-org/react";
import React from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, DropdownTrigger, Dropdown, DropdownMenu, DropdownItem, Chip, User, Pagination } from "@nextui-org/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";
import { PlusIcon as VerticalDotsIcon } from "lucide-react";
import { PlusIcon as SearchIcon } from "lucide-react";
import { ChevronDownIcon } from "lucide-react";
import { users } from "./data.js";
import Link from "next/link";

const statusColorMap = {
	active: "success",
	paused: "danger",
	vacation: "warning",
};
export function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

const statusOptions = [
	{ name: "Active", uid: "active" },
	{ name: "Paused", uid: "paused" },
	{ name: "Vacation", uid: "vacation" },
];

const columns = [
	{ name: "USER ID", uid: "id", sortable: true },
	{ name: "NAME", uid: "name", sortable: true },
	{ name: "ROLE", uid: "role", sortable: true },
	{ name: "TEAM", uid: "team" },
	{ name: "EMAIL", uid: "email" },
	{ name: "STATUS", uid: "status", sortable: true },
	{ name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["id", "name", "role", "status", "actions"];

export function UsersTable() {
	const [filterValue, setFilterValue] = React.useState("");
	const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
	const [visibleColumns, setVisibleColumns] = React.useState(new Set(INITIAL_VISIBLE_COLUMNS));
	const [statusFilter, setStatusFilter] = React.useState("all");
	const [rowsPerPage, setRowsPerPage] = React.useState(15);
	const [sortDescriptor, setSortDescriptor] = React.useState({
		column: "age",
		direction: "ascending",
	});
	const [page, setPage] = React.useState(1);

	const hasSearchFilter = Boolean(filterValue);

	const headerColumns = React.useMemo(() => {
		if (visibleColumns === "all") return columns;

		return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
	}, [visibleColumns]);

	const filteredItems = React.useMemo(() => {
		let filteredUsers = [...users];

		if (hasSearchFilter) {
			filteredUsers = filteredUsers.filter((user) => user.name.toLowerCase().includes(filterValue.toLowerCase()));
		}
		if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
			filteredUsers = filteredUsers.filter((user) => Array.from(statusFilter).includes(user.status));
		}

		return filteredUsers;
	}, [users, filterValue, statusFilter]);

	const pages = Math.ceil(filteredItems.length / rowsPerPage);

	const items = React.useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		const end = start + rowsPerPage;

		return filteredItems.slice(start, end);
	}, [page, filteredItems, rowsPerPage]);

	const sortedItems = React.useMemo(() => {
		return [...items].sort((a, b) => {
			const first = a[sortDescriptor.column];
			const second = b[sortDescriptor.column];
			const cmp = first < second ? -1 : first > second ? 1 : 0;

			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [sortDescriptor, items]);

	const renderCell = React.useCallback((user, columnKey) => {
		const cellValue = user[columnKey];

		switch (columnKey) {
			case "name":
				return (
					<User avatarProps={{ radius: "xl", src: user.avatar }} description={user.email} name={cellValue}>
						{user.email}
					</User>
				);
			case "role":
				return (
					<div className="flex flex-col">
						<p className="text-bold text-small capitalize">{cellValue}</p>
						<p className="text-bold text-tiny capitalize text-default-400">{user.team}</p>
					</div>
				);
			case "status":
				return (
					<Chip className="capitalize" color={statusColorMap[user.status]} size="sm" variant="flat">
						{cellValue}
					</Chip>
				);
			case "actions":
				return (
					<div className="relative flex items-center justify-end gap-2">
						<Dropdown>
							<DropdownTrigger>
								<Button size="sm" variant="light">
									<ChevronDownIcon className="text-default-300" />
								</Button>
							</DropdownTrigger>
							<DropdownMenu>
								<DropdownItem>View</DropdownItem>
								<DropdownItem>Edit</DropdownItem>
								<DropdownItem>Delete</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				);
			default:
				return cellValue;
		}
	}, []);

	const onNextPage = React.useCallback(() => {
		if (page < pages) setPage(page + 1);
	}, [page, pages]);

	const onPreviousPage = React.useCallback(() => {
		if (page > 1) setPage(page - 1);
	}, [page]);

	const onRowsPerPageChange = React.useCallback((e) => {
		setRowsPerPage(Number(e.target.value));
		setPage(1);
	}, []);

	const onSearchChange = React.useCallback((e) => {
		if (e.target.value) {
			setFilterValue(e.target.value);
			setPage(1);
		} else {
			setFilterValue("");
		}
	}, []);

	const TopContent = React.useMemo(() => {
		return (
			<div className="mb-2 flex flex-col gap-4">
				<div className="flex items-end justify-between gap-3 p-2">
					<Input className="w-full selection:outline-none" placeholder="Search by name..." value={filterValue} onChange={(e) => onSearchChange(e)} />
					<div className="flex gap-3">
						<Dropdown>
							<DropdownTrigger className="hidden sm:flex">
								<Button>Status</Button>
							</DropdownTrigger>
							<DropdownMenu disallowEmptySelection aria-label="Table Columns" closeOnSelect={false} selectedKeys={statusFilter} selectionMode="multiple" onSelectionChange={setStatusFilter}>
								{statusOptions.map((status) => (
									<DropdownItem key={status.uid} className="capitalize">
										{capitalize(status.name)}
									</DropdownItem>
								))}
							</DropdownMenu>
						</Dropdown>
						<Dropdown>
							<DropdownTrigger className="hidden sm:flex">
								<Button>Columns</Button>
							</DropdownTrigger>
							<DropdownMenu disallowEmptySelection aria-label="Table Columns" closeOnSelect={false} selectedKeys={visibleColumns} selectionMode="multiple" onSelectionChange={setVisibleColumns}>
								{columns.map((column) => (
									<DropdownItem key={column.uid} className="capitalize">
										{capitalize(column.name)}
									</DropdownItem>
								))}
							</DropdownMenu>
						</Dropdown>
						<Link href="/medibook/users?add">
							<Button color="primary">Add New</Button>
						</Link>
					</div>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-small text-default-400">Total {users.length} users</span>
					<label className="flex items-center text-small text-default-400">
						Rows per page:
						<select className="bg-transparent text-small text-default-400 outline-none" onChange={onRowsPerPageChange}>
							<option value="10">10</option>
							<option value="15">25</option>
							<option value="50">50</option>
							<option value="50">100</option>
						</select>
					</label>
				</div>
			</div>
		);
	}, [filterValue, statusFilter, visibleColumns, onSearchChange, onRowsPerPageChange, users.length, hasSearchFilter]);

	const BottomContent = () => {
		return (
			<div className="flex items-center justify-between px-2 py-2 font-[montserrat]">
				<span className="w-[30%] text-small text-default-400">{selectedKeys === "all" ? "All items selected" : `${selectedKeys.size} of ${filteredItems.length} selected`}</span>
				<Pagination isCompact showControls showShadow color="primary" page={page} total={pages} onChange={setPage} />
				<div className="hidden w-[30%] justify-end gap-2 sm:flex">
					<Button disabled={pages === 1} onClick={onPreviousPage}>
						Previous
					</Button>
					<Button disabled={pages === 1} onClick={onNextPage}>
						Next
					</Button>
				</div>
			</div>
		);
	};

	return (
		<NextUIProvider>
			<Table topContent={TopContent} isCompact removeWrapper className="h-auto overflow-x-scroll" aria-label="Example table with custom cells, pagination and sorting" isHeaderSticky selectedKeys={selectedKeys} selectionMode="multiple" sortDescriptor={sortDescriptor} topContentPlacement="outside" onSelectionChange={setSelectedKeys} onSortChange={setSortDescriptor}>
				<TableHeader columns={headerColumns}>
					{(column) => (
						<TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"} allowsSorting={column.sortable}>
							{column.name}
						</TableColumn>
					)}
				</TableHeader>
				<TableBody emptyContent={"No users found"} items={sortedItems}>
					{(item) => <TableRow key={item.id}>{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>}
				</TableBody>
			</Table>
			<BottomContent />
		</NextUIProvider>
	);
}
