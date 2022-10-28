import Layout from "../../../components/layouts/dashboard-layout";
import { useSession, getSession } from "next-auth/react";

function AnnouncementsPage() {
	return (
		<Layout>
			<div>
				<ul>
					<li>Hello</li>
					<li>Hello</li>
					<li>Hello</li>
					<li>Hello</li>
					<li>Hello</li>
					<li>Hello</li>
					<li>Hello</li>
					<li>Hello</li>
					<li>Hello</li>
					<li>Hello</li>
					<li>Hello</li>
				</ul>
			</div>
		</Layout>
	);
}

export default AnnouncementsPage;

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
