import { StyledBadge } from "../../components/app/pages/users/icons/StyledBadge";
import { IconButton } from "../../components/app/pages/users/icons/IconButton";
import { EyeIcon } from "../../components/app/pages/users/icons/EyeIcon";
import { EditIcon } from "../../components/app/pages/users/icons/EditIcon";
import { DeleteIcon } from "../../components/app/pages/users/icons/DeleteIcon";
import { useRouter } from "next/router";
import { useSession, getSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import style from "../../styles/users.module.css";
import { Fragment } from "react";

import { Spacer, Table, User, useAsyncList } from "@nextui-org/react";

import Layout from "../../app-components/layout";
import { Text, Button, Input, Tab, Tabs, TabList, TabPanel, TabPanels } from "@chakra-ui/react";
import prisma from "../../prisma/client";

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
function UsersPage(props) {
	const { data: session, status } = useSession();
	const loading = status === "loading";

	const [isLoading, setIsLoading] = useState(true);
	const [filterInput, setFilterInput] = useState("");
	const [fetchedUsers, setFetchedUsers] = useState(props.users);
	const [filteredUsers, setFilteredUsers] = useState(fetchedUsers);
	const filter_input_ref = useRef(null);
	const router = useRouter();
	useEffect(() => {
		getSession().then((session) => {
			if (!session) {
				router.replace("/login");
			} else {
				setIsLoading(false);
			}
		});
	}, [router]);

	if (!session) {
		return (
			<Layout>
				<p>Loading</p>
			</Layout>
		);
	}

	function newFilter() {
		console.log("filter_input_ref.current.value");
		console.log(fetchedUsers);
		const newFilteredUsers = fetchedUsers.filter((user) => {
			if (
				user.officialName.toLowerCase().includes(filter_input_ref.current.value.toLowerCase()) ||
				user.email.toLowerCase().includes(filter_input_ref.current.value.toLowerCase()) ||
				user.officialSurname.toLowerCase().includes(filter_input_ref.current.value.toLowerCase())
			) {
				return true;
			} else {
				return false;
			}
		});
		setFilteredUsers(newFilteredUsers);
		console.log(newFilteredUsers);
	}

	return (
		<Layout>
			<div
				style={{
					border: "2px solid #E2E8F0",
					padding: "5px",
					borderRadius: "0.7rem",
				}}>
				<div className={style.buttonGroup}>
					<Button backgroundColor="var(--mediblue)" color="white" mr={2}>
						Add User
					</Button>
					<Button backgroundColor="var(--mediblue)" color="white" mr={2}>
						Verify New User
					</Button>
					<Button mr={2}>Lock Account</Button>
					<Button mr={2}>Unlock Account</Button>
					<Button mr={2}>Unlock Account</Button>
				</div>
				<div className="fdr">
					<Input
						onChange={() => {
							setFilterInput(filter_input_ref.current.value);
							newFilter();
						}}
						ref={filter_input_ref}
						value={filterInput}
						color="black"
						backgroundColor="#EDF2F7"
						mr={2}
						mt={2}
						aria-label={"Search User"}
						placeholder="Search User"
						size="md"
					/>
					<Button mt={2}>Clear</Button>
				</div>
			</div>
			<Spacer y={0.5} />
			<Table
				lined
				aria-label="Users Table"
				bordered="false"
				shadow={false}
				css={{
					height: "auto",
					minWidth: "100%",
				}}
				/* 				selectionMode="multiple"
				 */ headerLined>
				<Table.Header>
					<Table.Column>NAME</Table.Column>
					<Table.Column>SURNAME</Table.Column>
					<Table.Column>EMAIL</Table.Column>
					<Table.Column>PHONE</Table.Column>
					<Table.Column>ACTiONS`</Table.Column>
				</Table.Header>
				<Table.Body>
					{filteredUsers.map((user) => (
						<Table.Row key={user.userNumber}>
							<Table.Cell>
								{user.officialName}
								<br />
								{user.displayName}
							</Table.Cell>
							<Table.Cell>
								{user.officialSurname}
								<br />
								{user.displaySurname}
							</Table.Cell>
							<Table.Cell>{user.email}</Table.Cell>
							<Table.Cell></Table.Cell>
							<Table.Cell>
								{user.userNumber !== session.user.userNumber ? (
									<Fragment>
										<Button
											mr={2}
											isLoading={isLoading}
											onClick={() => {
												router.push(`/users/${user.userNumber}/edit`);
												setIsLoading(true);
											}}>
											Edit
										</Button>
										<Button
											isLoading={isLoading}
											onClick={() => {
												router.push(`/users/${user.userNumber}`);
												setIsLoading(true);
											}}>
											View
										</Button>
									</Fragment>
								) : null}
							</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table>
		</Layout>
	);
}

export default UsersPage;

export async function getServerSideProps(context) {
	const session = await getSession({ req: context.req });

	if (!session) {
		return {
			redirect: {
				destination: "/login",
				permament: false,
			},
		};
	}
	const users = await prisma.user.findMany({
		select: {
			officialName: true,
			officialSurname: true,
			displayName: true,
			displaySurname: true,
			email: true,
			phoneNumber: true,
			userNumber: true,
			delegate: true,
			schoolStudent: { select: { school: { select: { name: true } } } },
		},
	});
	console.log(users);
	return {
		props: { session, users },
	};
}
