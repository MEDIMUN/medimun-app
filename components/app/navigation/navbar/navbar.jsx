import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { signOut, useSession, getSession } from "next-auth/react";
import { NavbarToggleIcon } from "./icons";
import { BiMenuAltLeft } from "react-icons/bi";
import { TbMessage, TbSettings, TbBellRinging } from "react-icons/tb";

import style from "./navbar.module.css";

import { Button, Navbar, Text, Spacer } from "@nextui-org/react";
import Logo from "../../../common/branding/logo/main";
import AppContext from "../../context/Navigation";

export default function DashboardNavbar() {
	const sidebarCtx = useContext(AppContext);
	const { data: session, status } = useSession();
	const loading = status === "loading";

	const [logOut, setLogOut] = useState(false);
	if (logOut) {
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
					css={{ borderRadius: "17px", width: "40px", height: "40px" }}
					color="#FFFFFF"
					onPress={toggleSidebar}>
					<BiMenuAltLeft
						size={30}
						color="rgba(33,116,255)"
					/>
				</Button>

				<Button
					size="auto"
					css={{ borderRadius: "17px", width: "40px", height: "40px" }}
					color="#FFFFFF">
					<TbSettings
						size={30}
						color="rgba(33,116,255)"
					/>
				</Button>
			</Navbar.Content>
			<Spacer y={1} />

			<Navbar.Content>
				<Logo
					color="blue"
					width={200}
					height={50}
				/>
			</Navbar.Content>
			<Spacer y={1} />
			<Navbar.Content>
				<Button
					size="auto"
					css={{ borderRadius: "17px", width: "40px", height: "40px" }}
					color="#FFFFFF">
					<TbBellRinging
						size={30}
						color="rgba(33,116,255)"
					/>
				</Button>
				<Button
					size="auto"
					css={{ borderRadius: "17px", width: "40px", height: "40px" }}
					color="#FFFFFF">
					<TbMessage
						size={30}
						color="rgba(33,116,255)"
					/>
				</Button>
			</Navbar.Content>
		</Navbar>
	);
}
