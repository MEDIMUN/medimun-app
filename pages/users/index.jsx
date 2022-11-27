import { StyledBadge } from "../../components/app/pages/users/icons/StyledBadge";
import { IconButton } from "../../components/app/pages/users/icons/IconButton";
import { EyeIcon } from "../../components/app/pages/users/icons/EyeIcon";
import { EditIcon } from "../../components/app/pages/users/icons/EditIcon";
import { DeleteIcon } from "../../components/app/pages/users/icons/DeleteIcon";
import { useRouter } from "next/router";
import { useSession, getSession } from "next-auth/react";
import { useState, useEffect } from "react";

import { Table, User } from "@nextui-org/react";

import Layout from "../../components/app/layout/layout";

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
			<Table
				selectionMode="multiple"
				bordered>
				<Table.Header>
					<Table.Column>USER</Table.Column>
					<Table.Column>COMMITTEE</Table.Column>
					<Table.Column>STATUS</Table.Column>
					<Table.Column>ACTIONS</Table.Column>
					<Table.Column>ALUMNI</Table.Column>
				</Table.Header>
				<Table.Body>
					<Table.Row key="1">
						<Table.Cell>
							<User
								squared
								name="John Doe"
								css={{ p: 0 }}>
								hello
							</User>
						</Table.Cell>
						<Table.Cell>CEO</Table.Cell>
						<Table.Cell>Active</Table.Cell>
						<Table.Cell>ACTION</Table.Cell>
						<Table.Cell>ALUMNI</Table.Cell>
					</Table.Row>
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
	return {
		props: { session },
	};
}
