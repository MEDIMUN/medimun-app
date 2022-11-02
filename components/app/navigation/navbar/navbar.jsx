import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { signOut, useSession, getSession } from "next-auth/react";
import { NavbarToggleIcon } from "./icons";

import style from "./navbar.module.css";

import { Button, Navbar, Text } from "@nextui-org/react";
import Logo from "../../../common/branding/logo/main";
import AppContext from "../../context/Navigation";

export default function DashboardNavbar() {
	const sidebarCtx = useContext(AppContext);
	const { data: session, status } = useSession();
	const loading = status === "loading";

	const [logOut, setLogOut] = useState(false);
	if (logOut) {
		signOut({ callbackUrl: "/login" });
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
	}, [router]);

	function toggleSidebar() {
		sidebarCtx.toggleSidebarVisibility();
	}

	return (
		<Navbar
			className={style.navbar}
			isCompact
			css={{
				position: "absolute",
				backgroundColor: "white",
				borderRadius: "5px 5px 0 0",
				boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.2)",
			}}
			maxWidth="xl"
			variant="">
			<Navbar.Content>
				<Button
					size="auto"
					css={{ borderRadius: "7.5px", backgroundColor: "white" }}
					onPress={toggleSidebar}>
					<NavbarToggleIcon />
				</Button>
			</Navbar.Content>
			<Navbar.Content>
				<Logo color="blue" />
			</Navbar.Content>
			<Navbar.Content>
				<Text>Settings</Text>
			</Navbar.Content>
		</Navbar>
	);
}
