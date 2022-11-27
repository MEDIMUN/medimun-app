import { getSession } from "next-auth/react";

import Layout from "../../components/app/layout/layout";

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
function AnnouncementsPage(props) {
	return (
		<Layout>
			<div>
				<ul>
					<h1>Hello</h1>
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
