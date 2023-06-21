import { useRouter } from "next/router";
import { Fragment, useContext, useState, useEffect } from "react";
import { getSession, useSession } from "next-auth/react";

import style from "./layout.module.css";
//hello
import Sidebar from "@app-components/sidebar";
import AppContext from "@app-components/context/Navigation";
import { Navbar, Spacer } from "@nextui-org/react";
import Logo from "@logo";
export default function Layout(props) {
	const [sidebar, setSidebar] = useState(true);

	const SidebarCtx = useContext(AppContext);
	const sidebarVisibility = SidebarCtx.sidebarVisibility;

	function toggleSidebar() {
		SidebarCtx.toggleSidebarVisibility();
	}

	return (
		<div className={sidebarVisibility ? style.layout : style.boxedLayout}>
			<div className={style.sidebar}>
				<Sidebar setSidebar={toggleSidebar} />
			</div>
			<div className={sidebarVisibility ? style.content : style.boxedContent}>
				<nav className={style.navbar}>
					<Navbar maxWidth="fluid" isCompact>
						<div className="fdr">
							<Navbar.Toggle onChange={toggleSidebar} isSelected={sidebarVisibility} css={{ color: "black" }} />
							{!sidebarVisibility && (
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
								<h1 className={style.title}>Users</h1>
							</Navbar.Item>
						</Navbar.Content>
					</Navbar>
				</nav>
				<main className={style.main}>{props.children}</main>
			</div>
		</div>
	);
}
