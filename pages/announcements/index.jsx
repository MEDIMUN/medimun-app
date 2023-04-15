import Layout from "@app-layout";
import AppContext from "@app-components/context/Navigation";
import { useContext, useEffect } from "react";
import { findUserDetails } from "@lib/user-roles";
import { useFirstRender } from "@hooks/useFirstRender";
import { updateUserProps, updateUser } from "@lib/user-update";
import { getSession } from "next-auth/react";

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function Page(props) {
	updateUser(props.userUpdate);

	return <Layout>{"HI"}</Layout>;
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
