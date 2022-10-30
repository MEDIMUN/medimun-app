import { useRouter } from "next/router";
import { Fragment, useContext, useState, useEffect } from "react";
import { getSession, useSession } from "next-auth/react";

import style from "./layout.module.css";

import DashboardNavbar from "../navigation/navbar/navbar";
import Sidebar from "../navigation/sidebar/sidebar";
import AppContext from "../context/Navigation";

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
	}, []);

	const SidebarCtx = useContext(AppContext);

	const sidebarVisibility = SidebarCtx.sidebarVisibility;

	return (
		<Fragment>
			<div className={style.borderFrame}>
				<div className={style.content}>
					<div className={style.navbar}>
						<DashboardNavbar />
					</div>
					<div className={style.wrapper}>
						{sidebarVisibility && <div className={style.sidebarPlaceHolder}></div>}
						{sidebarVisibility && (
							<div className={style.sidebar}>
								<Sidebar props={session.user.official_name + session.user.official_surname} />
							</div>
						)}
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
