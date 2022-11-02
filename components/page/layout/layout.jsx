import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getSession, useSession } from "next-auth/react";

import style from "./layout.module.css";

import PageNavbar from "../navigation/navbar/navbar";
import PageFooter from "../navigation/footer/footer";

function Pagelayout(props) {
	const { data: session, status } = useSession();
	const loading = status === "loading";

	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	useEffect(() => {
		getSession().then((session) => {
			if (session) {
				router.replace("/app");
			} else {
				setIsLoading(false);
			}
		});
	}, [router]);

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
