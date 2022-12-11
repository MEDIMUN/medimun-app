import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getSession, useSession } from "next-auth/react";

import style from "./layout.module.css";

import PageNavbar from "../navigation/navbar/navbar";
import PageFooter from "../navigation/footer/footer";

function Pagelayout(props) {
	const router = useRouter();
	const { data: session, status } = useSession();

	const loading = status === "loading";
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		getSession().then((session) => {
			if (session) {
				router.replace("/");
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
			<PageNavbar className={style.navbar} />
			{props.children}
			<PageFooter className={style.footer} />
		</Fragment>
	);
}

export default Pagelayout;
