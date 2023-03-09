import { useRouter } from "next/router";
import { Fragment, useContext, useState, useEffect } from "react";
import { getSession, useSession } from "next-auth/react";
import { AiOutlineMenu } from "react-icons/ai";

import style from "./layout.module.css";

import DashboardNavbar from "../components/app/navigation/navbar/navbar";
import Sidebar from "../components/app/navigation/sidebar/sidebar";
import AppContext from "../components/app/context/Navigation";
import Landscape from "../common-components/popups/landscape/index";
import { Navbar, Spacer } from "@nextui-org/react";
import { Text } from "@chakra-ui/react";
import Logo from "../components/common/branding/logo/main";
export default function Layout(props) {
	const { data: session, status } = useSession();
	const loading = status === "loading";

	const [isLoading, setIsLoading] = useState(true);
	const [sidebar, setSidebar] = useState(true);
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
			{sidebar && (
				<div className={style.sidebar}>
					<Sidebar setSidebar={setSidebar} />
				</div>
			)}
			<div className={style.content}>
				<nav>
					<Navbar maxWidth="fluid" isCompact>
						<div className="fdr">
							<Navbar.Toggle onChange={setSidebar} isSelected={sidebar} css={{ color: "black" }} />
							{!sidebar && (
								<Fragment>
									<Spacer x={0.5} />
									<Navbar.Brand>
										<Logo className={style.logo} color="blue" width={136} height={34} />
									</Navbar.Brand>
								</Fragment>
							)}
						</div>
						<Navbar.Content>
							<Navbar.Item>
								<Text className={style.title}>Users</Text>
							</Navbar.Item>
						</Navbar.Content>
					</Navbar>
				</nav>
				<main className={style.main}>{props.children}</main>
			</div>
		</div>
	);
}
