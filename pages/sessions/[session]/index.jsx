import Layout from "@app-layout";
import { useRouter } from "next/router";
import { updateUserProps, updateUser } from "@lib/user-update";
import { findUserDetails } from "@lib/user-roles";
import { getSession } from "next-auth/react";

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function Page(props) {
	updateUser(props.userUpdate);
	const router = useRouter();
	return (
		<Layout>
			<h1>{`SESSION: ${props.session} - COMMITTEE:${props.committee} - DEPARTMENT:${props.department}`}</h1>
		</Layout>
	);
}

export async function getServerSideProps(context) {
	const session = await getSession({ req: context.req });
	const userDetails = await findUserDetails(await session.user.userNumber);
	return {
		props: {
			userUpdate: await updateUserProps(userDetails),
		},
	};
}
