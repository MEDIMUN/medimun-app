import prisma from "../../client";

import { Button, Loading, Spacer, Input } from "@nextui-org/react";
import Pagelayout from "../../components/page/layout/layout";

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function SignupPage(props) {
	return <Pagelayout></Pagelayout>;
}

export async function getServerSideProps(context) {
	const { code } = context.query;
	try {
		const pendingUser = await prisma.pendingUser.findFirst({
			where: {
				email_verification_code: code,
			},
		});
		console.log(pendingUser);
		if (!pendingUser) {
			return {
				notFound: true,
			};
		}

		if (pendingUser.email_verification_code == code) {
			console.log("TRUE");
			const user = await prisma.user.create({
				data: {
					email: pendingUser.email,
					password: pendingUser.password,
					official_name: pendingUser.official_name,
					official_surname: pendingUser.official_surname,
					display_name: pendingUser.display_name,
					display_surname: pendingUser.display_surname,
					date_of_birth: pendingUser.date_of_birth,
					role: pendingUser.role,
				},
			});

			const result = await prisma.pendingUser.delete({
				where: {
					email: pendingUser.email,
				},
			});
		} else {
			return {
				notFound: true,
			};
		}
	} catch (e) {
		console.log(e);
		if (e) {
			return {
				notFound: true,
			};
		}
	}
	return {
		redirect: {
			destination: "/login",
			permanent: false,
		},
	};
}
