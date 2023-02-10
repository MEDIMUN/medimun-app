import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getSession, useSession } from "next-auth/react";

import style from "./layout.module.css";

import PageNavbar from "./navigation/navbar";
import PageFooter from "./navigation/footer";
import Landscape from "../common-components/popups/landscape";
import { IoPeopleSharp } from "react-icons/io5";
import { Spacer } from "@nextui-org/react";

export default function Pagelayout(props) {
	const router = useRouter();
	const { data: session, status } = useSession();

	const loading = status === "loading";
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		getSession().then((session) => {
			if (session) {
			} else {
				setIsLoading(false);
			}
		});
	}, [router]);

	if (isLoading) {
		return <p>Loading</p>;
	}

	return (
		<Fragment>
			<Landscape />
			<PageNavbar className={style.pageNavbar} backgroundColor={props.backgroundColor} />
			<main className={style.page}>{props.children}</main>
			<footer>
				<PageFooter className={style.footer} />
			</footer>
		</Fragment>
	);
}
