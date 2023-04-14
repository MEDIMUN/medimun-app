import Layout from "@app-layout";
import { useRouter } from "next/router";
/* import prisma from "@client";
 */
/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function Page(props) {
	const router = useRouter();
	return <Layout>Tasks</Layout>;
}

export async function getServerSideProps(context) {
	return {
		props: {},
	};
}
