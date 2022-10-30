import styles from "../styles/Home.module.css";
import Pagelayout from "../components/page/layout/layout";
import { getSession, useSession } from "next-auth/react";

function HomePage() {
	return (
		<Pagelayout>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
			<h1 className={styles.black}>HOLLLLAAAAAAA</h1>
		</Pagelayout>
	);
}

export default HomePage;

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
	return {
		props: { session },
	};
}
