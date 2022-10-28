import Layout from "../../components/layouts/dashboard-layout";
import { getSession, useSession } from "next-auth/react";

export default function Dashboard() {
	return (
		<Layout page={"Register"}>
			<h1>Dashboard</h1>
		</Layout>
	);
}

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
