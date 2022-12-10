import styles from "../styles/Home.module.css";
import Pagelayout from "../components/page/layout/layout";
import { getSession, useSession } from "next-auth/react";
import Layout from "../components/app/layout/layout";
import Image from "next/image";
import HeroPic from "../public/pages/index/hero.png";
import style from "../styles/index.module.css";
import { Spacer, Text } from "@nextui-org/react";
import { Fragment } from "react";
import Head from "next/head";

export default function HomePage(props) {
	const { data: session, status } = useSession();
	var time = new Date();
	let greeting;
	if (time.getHours() >= 12) {
		greeting = "Good afternoon";
	}
	if (time.getHours() >= 18) {
		greeting = "Good evening";
	}
	if (!session) {
		return (
			<Fragment>
				<Head>
					<meta
						name="theme-color"
						content="#000"></meta>
				</Head>
				<Pagelayout>
					<div className={style.herotext}>
						<Text
							className={style.herotext1}
							h1
							size={120}
							weight="bold">
							Building Resilience
						</Text>
						<Spacer y={1} />
						<Text
							className={style.herotext2}
							h1
							size={120}
							weight="light">
							A Transformative Agenda
						</Text>
					</div>
					<div className={style.black}></div>
					<div className={style.imagehero}></div>
				</Pagelayout>
			</Fragment>
		);
	}

	if (session) {
		return (
			<Layout page={"Register"}>
				<h2>{greeting + ", " + session.user.display_name || session.user.official_name}</h2>
				<iframe src="https://storage-s3.manage.beoz.org/try/medimun%20sweatshirts%20%281%29.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=U28I0V5DYOYW69XWFCE8%2F20221125%2Feu-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221125T175658Z&X-Amz-Expires=604800&X-Amz-Security-Token=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NLZXkiOiJVMjhJMFY1RFlPWVc2OVhXRkNFOCIsImV4cCI6MzYwMDAwMDAwMDAwMCwicG9saWN5IjoiY29uc29sZUFkbWluIn0.qwUelhtDVj0eVX5yoctktRgyFldE5dUYmtFYsPdTK8GVpJXth_HaMBsw7evVO2GGVE6gBtx19iSM4wPt0ljNNw&X-Amz-SignedHeaders=host&versionId=null&X-Amz-Signature=405eff5fd1cb17138e67c49c5e5e75e0d0be0ea385e820abb66e450deaebdf92"></iframe>
			</Layout>
		);
	}
}

//export async function getServerSideProps(context) {
//	const session = await getSession({ req: context.req });
//
//	if (session) {
//		return {
//			redirect: {
//				destination: "/app",
//				permament: false,
//			},
//		};
//	}
//	return { props: {} };
//}
