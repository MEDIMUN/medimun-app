import Sidebar from "../navigation/sidebar";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import style from "./dashboard-layout.module.css";
import { Fragment } from "react";
import { getSession, useSession, signOut } from "next-auth/react";
import DashboardNavbar from "../navigation/dashboard-navbar";

export default function Layout(props) {
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
			if (!session) {
				router.replace("/login");
			} else {
				setIsLoading(false);
			}
		});
	}, []);

	const [sidebarVisibility, setSidebarVisibility] = useState(true);
	function sidebarVisibilityHandler() {
		setSidebarVisibility(!sidebarVisibility);
	}

	console.log(sidebarVisibility);

	return (
		<Fragment>
			<div className={style.borderFrame}>
				<div className={style.content}>
					<div className={style.navbar}>
						<DashboardNavbar />
					</div>
					<div className={style.wrapper}>
						{sidebarVisibility && <div className={style.sidebarPlaceHolder}></div>}
						<div className={style.sidebar}>
							<Sidebar props={session.user.official_name + session.user.official_surname} />
						</div>
						<div className={style.mainContent}>{props.children}</div>
					</div>
				</div>
			</div>
		</Fragment>
	);
}

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
