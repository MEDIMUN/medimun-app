import { useRouter } from "next/router";
import { Fragment, useContext, useState, useEffect } from "react";
import { getSession, useSession } from "next-auth/react";

import style from "./layout.module.css";

import DashboardNavbar from "../navigation/navbar/navbar";
import Sidebar from "../navigation/sidebar/sidebar";
import AppContext from "../context/Navigation";
import Landscape from "../../../common-components/popups/landscape/index";
import Logo from "../../common/branding/logo/main";

export default function Layout(props) {
	const { data: session, status } = useSession();
	const loading = status === "loading";

	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	useEffect(() => {
		getSession().then((session) => {
			if (!session) {
				router.replace("/login");
			} else {
				setIsLoading(false);
			}
		});
	}, [router]);

	const SidebarCtx = useContext(AppContext);

	const sidebarVisibility = SidebarCtx.sidebarVisibility;

	return (
		<div className={style.layout}>
			<Landscape />
			<div className={style.sidebar}>
				<Sidebar />
			</div>
			<div className={style.content}>{props.children}</div>
		</div>
	);
}
