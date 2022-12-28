import prisma from "../../prisma/client";

import { Button, Loading, Spacer, Input } from "@nextui-org/react";
import Pagelayout from "../../components/page/layout/layout";
import randomString from "../../lib/random-string";

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function SignupPage(props) {
	return <Pagelayout></Pagelayout>;
}

export async function getServerSideProps(context) {
	const { code } = context.query;
	try {
		const pendingUser = await prisma.pendingUser.findFirst({
			where: {
				emailVerificationCode: code,
			},
		});
		console.log(pendingUser);
		if (!pendingUser) {
			return {
				notFound: true,
			};
		}

		let userId;

		do {
			userId = randomString(10, "##########");
		} while (
			(await prisma.user.findFirst({
				where: {
					userNumber: userId,
				},
			})) != null
		);

		if (pendingUser.emailVerificationCode == code) {
			console.log("TRUE");
			const user = await prisma.user.create({
				data: {
					email: pendingUser.email,
					password: pendingUser.password,
					officialName: pendingUser.officialName,
					officialSurname: pendingUser.officialSurname,
					displayName: pendingUser.displayName,
					displaySurname: pendingUser.displaySurname,
					dateOfBirth: pendingUser.dateOfBirth,
					role: pendingUser.role,
					userNumber: userId,
					username: "",
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
