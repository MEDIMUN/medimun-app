import prisma from "@client";
import { useRouter } from "next/router";
import { useEffect } from "react";

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function Page(props) {
	const router = useRouter();
	useEffect(() => {
		router.push(props.redirect);
	}, [router]);
	return <></>;
}
export async function getServerSideProps(context) {
	const { params } = context.query;
	let currentSession = await prisma.session.findFirst({
		where: {
			isCurrent: true,
		},
		select: {
			number: true,
		},
	});

	if (!currentSession) {
		return {
			redirect: {
				destination: "/404",
				permanent: false,
			},
		};
	}

	return {
		props: {
			redirect: `/sessions/${await currentSession.number}/committees/${params.join("/")}`,
		},
	};
}
