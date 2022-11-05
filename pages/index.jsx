import styles from "../styles/Home.module.css";
import Pagelayout from "../components/page/layout/layout";
import { getSession, useSession } from "next-auth/react";

export default function HomePage() {
	return (
		<Pagelayout>
			<h1 className={styles.black}>Homepage</h1>
		</Pagelayout>
	);
}

export async function getServerSideProps(context) {
	const session = await getSession({ req: context.req });

	if (session) {
		return {
			redirect: {
				destination: "/app",
				permament: false,
			},
		};
	}
	return { props: {} };
}
