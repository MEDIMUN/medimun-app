import Layout from "@app-layout";
import { useRouter } from "next/router";
/* import prisma from "@client";
 */
/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function Page(props) {
	const router = useRouter();
	return (
		<Layout>
			<h1>{`SESSION: ${props.session} - COMMITTEE:${props.committee} - DEPARTMENT:${props.department}`}</h1>
		</Layout>
	);
}

export async function getServerSideProps(context) {
	const { session, committee, department } = context.query;
	return {
		props: {
			session,
			committee: committee ?? "not defined",
			department: department ?? "not defined",
		},
	};
}
