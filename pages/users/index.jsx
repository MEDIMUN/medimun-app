import { StyledBadge } from "../../components/app/pages/users/icons/StyledBadge";
import { IconButton } from "../../components/app/pages/users/icons/IconButton";
import { EyeIcon } from "../../components/app/pages/users/icons/EyeIcon";
import { EditIcon } from "../../components/app/pages/users/icons/EditIcon";
import { DeleteIcon } from "../../components/app/pages/users/icons/DeleteIcon";
import { useRouter } from "next/router";
import { useSession, getSession } from "next-auth/react";
import { useState, useEffect } from "react";
import style from "../../styles/users.module.css";

import { Spacer, Table, User, useAsyncList } from "@nextui-org/react";

import Layout from "../../app-components/layout";
import { Text, Button, Input } from "@chakra-ui/react";
import prisma from "../../prisma/client";

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
function UsersPage(props) {
	const { data: session, status } = useSession();
	const loading = status === "loading";

	const [isLoading, setIsLoading] = useState(true);
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

	return (
		<Layout>
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
				<Input color="black" backgroundColor="#EDF2F7" mr={2} mt={2} placeholder="Search User" size="md" />
				<Button mt={2}>Search</Button>
			</div>

			<Spacer y={0.5} />
			<Table
				bordered="false"
				compact
				shadow={false}
				css={{
					height: "auto",
					minWidth: "100%",
				}}
				selectionMode="multiple"
				headerLined>
				<Table.Header>
					<Table.Column>USER</Table.Column>
					<Table.Column>EMAIL</Table.Column>
					<Table.Column>ACTIONS</Table.Column>
					<Table.Column>PHONE</Table.Column>
				</Table.Header>
				<Table.Body>
					{props.users.map((user) => (
						<Table.Row key={user.userNumber}>
							<Table.Cell>{user.officialName + " " + user.officialSurname}</Table.Cell>
							<Table.Cell>{user.email}</Table.Cell>
							<Table.Cell>
								{user.userNumber !== session.user.userNumber ? (
									<Button
										isLoading={isLoading}
										onClick={() => {
											router.push(`/users/${user.userNumber}/edit`);
											setIsLoading(true);
										}}>
										Edit
									</Button>
								) : (
									<Button
										color="red"
										isLoading={isLoading}
										onClick={() => {
											router.push("/account");
											setIsLoading(true);
										}}>
										Account
									</Button>
								)}
							</Table.Cell>
							<Table.Cell></Table.Cell>
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
			email: true,
			phoneNumber: true,
			userNumber: true,
			delegate: true,
		},
	});
	console.log(users);
	return {
		props: { session, users },
	};
}
