import { Navbar, User, Content, Link, Dropdown, Avatar, Text } from "@nextui-org/react";
import style from "./dashboard-navbar.module.css";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useSession, getSession } from "next-auth/react";
import Logo from "../logos/main-logo";

export default function DashboardNavbar() {
	const { data: session, status } = useSession();
	const loading = status === "loading";
	console.log(session);
	function logOutHandler() {
		console.log("log out");
		signOut({ callbackUrl: "/login" });
	}

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
	}, []);

	return (
		<Navbar
			className={style.navbar}
			isCompact
			css={{
				position: "absolute",
				backgroundColor: "white",
				borderRadius: "5px 5px 0 0",
			}}
			color={"none"}
			maxWidth="xl"
			variant="">
			<Navbar.Content>
				<Navbar.Toggle aria-label="toggle navigation" />
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
