import PageNavbar from "../../components/navigation/page-navbar";
import { Fragment, useState, useEffect } from "react";
import style from "./page-layout.module.css";
import PageFooter from "../footers/page-footer";
import { useRouter } from "next/router";
import { getSession, useSession } from "next-auth/react";

function Pagelayout(props) {
	const { data: session, status } = useSession();
	const loading = status === "loading";
	console.log(session);
	function logOutHandler() {
		console.log("log out");
		signOut({ callbackUrl: "/" });
	}

	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	useEffect(() => {
		getSession().then((session) => {
			if (session) {
				router.replace("/dashboard");
			} else {
				setIsLoading(false);
			}
		});
	}, []);

	if (isLoading) {
		return (
			<PageNavbar>
				<p>Loading</p>
			</PageNavbar>
		);
	}
	return (
		<Fragment>
			<PageNavbar text={props.notificationText || ""} />
			<div
				style={{ padding: props.margin || "10" }}
				className={style.container}>
				{props.children}
			</div>
			<div className={style.footer}>
				<PageFooter />
			</div>
		</Fragment>
	);
}

export default Pagelayout;
