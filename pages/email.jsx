import style from "@styles/email/webmail.module.css";
import Layout from "@app-layout";
import { updateUserProps, updateUser } from "@lib/user-update";
import { findUserDetails } from "@lib/user-roles";
import { getSession } from "next-auth/react";

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function Webmail(props) {
	updateUser(props.userUpdate);
	return (
		<Layout>
			<div>
				<iframe className={style.iframe} src="https://mail.manage.beoz.org/mail"></iframe>
			</div>
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
