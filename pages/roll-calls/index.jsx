import { updateUserProps, updateUser } from "@lib/user-update";
import { findUserDetails } from "@lib/user-roles";
import { getSession } from "next-auth/react";

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function Page(props) {
	updateUser(props.userUpdate);
	return <div>Page</div>;
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
