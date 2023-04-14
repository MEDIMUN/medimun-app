import { useState, useContext, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import AppContext from "@app-components/context/Navigation";
import { IoSettings } from "react-icons/io5";
import { Menu, MenuButton, MenuList, MenuItem, MenuItemOption, MenuGroup, MenuOptionGroup, MenuDivider } from "@chakra-ui/react";
import style from "./sidebar.module.css";
import { useRouter } from "next/router";
import Link from "next/link";
import { Text } from "@chakra-ui/react";

import { Navbar, Spacer, User } from "@nextui-org/react";
import { Button, Select } from "@chakra-ui/react";
import { GrFormClose as IoCloseCircleOutline } from "react-icons/gr";
import { FcHome, FcBriefcase, FcSpeaker, FcTodoList, FcCalendar, FcAddressBook, FcPodiumWithSpeaker, FcConferenceCall, FcBusiness, FcAcceptDatabase, FcWorkflow, FcCollaboration, FcPortraitMode, FcExport, FcMenu } from "react-icons/fc";

import Logo from "@logo";

function Sidebar(props) {
	const router = useRouter();
	const { data: session, status } = useSession();

	const [sidebarOpen, setSidebarOpen] = useState(false);

	function SidebarUsersButton(props) {
		const router = useRouter();

		const pageMap = {
			"/": "Home",
			"/users": "Users",
			"/announcements": "Announcements",
			"/app/tasks": "Tasks",
			"/app/schedule": "Schedule",
			"/app/email": "Email",
			"/app/my-committee": "My Committee",
			"/app": "Home",
			"/app/committees": "Committees",
			"/app/committee": "My Committee",
			"/sessions": "Sessions",
		};

		return (
			<li
				onClick={() => {
					router.push(props.href);
				}}
				className={pageMap[router.pathname] === props.text ? style.sidebarSelectedItem : style.sidebarItem}>
				<div className={style.iconWrapper}>{props.icon}</div>
				<Text className={style.text}>{props.text}</Text>
			</li>
		);
	}

	function OptionsButton(props) {
		return (
			<li onClick={props.action} className={style.sidebarItem}>
				<div className={style.iconWrapper}>{props.icon}</div>
				<Text className={style.text}>{props.text}</Text>
			</li>
		);
	}

	/* 	let username;
	if (!session) {
		username = " ";
	} else {
		username = (session.user.displayName || session.user.officialName) + " " + (session.user.displaySurname || session.user.officialSurname);
	} */

	function shorten(str, n) {
		return str.length > n ? str.slice(0, n - 1) + "..." : str;
	}

	function logOutHandler() {
		signOut({ callbackUrl: "/login" });
	}
	const setSidebar = props.setSidebar;

	const name = props.name;
	return (
		<div className={style.sidebar}>
			<div className={style.zero}>
				<div className={style.closeButtonWrapper}>
					<IoCloseCircleOutline onClick={() => setSidebar(false)} className={style.closeButton} />
				</div>
				<Logo color="blue" width={136} height={34} />
			</div>
			<ul className={style.one}>
				<div className="fdr">
					<SidebarUsersButton text={"Session"} href={"/sessions"} icon={<FcWorkflow />} />
					<Spacer x={0.5} />
					<Select></Select>
				</div>
				<div>
					<SidebarUsersButton text={"Home"} href={"/"} icon={<FcHome color="blue" />} />
					<SidebarUsersButton text={"My Committee"} href={"/my-committee"} icon={<FcBriefcase />} />
				</div>
				<div>
					<SidebarUsersButton text={"Announcements"} href={"/announcements"} icon={<FcSpeaker />} />
					<SidebarUsersButton text={"Tasks"} href={"/tasks"} icon={<FcTodoList />} />
					<SidebarUsersButton text={"Schedule"} href={"/schedule"} icon={<FcCalendar />} />
				</div>
				<div>
					<SidebarUsersButton text={"Email"} href={"/email"} icon={<FcAddressBook />} />
					<SidebarUsersButton text={"Users"} href={"/users"} icon={<FcPodiumWithSpeaker />} />
					<SidebarUsersButton text={"Committees"} href={"/committees"} icon={<FcConferenceCall />} />
					<SidebarUsersButton text={"Departments"} href={"/departments"} icon={<FcBusiness />} />
				</div>
				<div>
					<SidebarUsersButton text={"Applications"} href={"/applications"} icon={<FcAcceptDatabase />} />
					<SidebarUsersButton text={"Sessions"} href={"/sessions"} icon={<FcWorkflow />} />
				</div>
			</ul>
			<div className={style.two}>
				{sidebarOpen && (
					<ul className={style.userOptions}>
						<OptionsButton text={"Give Feedback"} action={() => router.push("/feedback")} icon={<FcCollaboration />} />
						<OptionsButton text={"Account"} action={() => router.push("/account")} icon={<FcPortraitMode />} />
						<OptionsButton text={"Sign Out"} action={logOutHandler} icon={<FcExport />} />
					</ul>
				)}

				<div className={style.profileButton}>
					{/* 					<User css={{ paddingLeft: "0px" }} src="https://avatars.githubusercontent.com/u/90158764?v=4" name={shorten(username, 18)} description={session ? session.user.roles[0].role : "Applicant"} />
					 */}
					<div className={style.settingsIconHolder}>
						<Button className={style.settings} onClick={() => setSidebarOpen(!sidebarOpen)}>
							<FcMenu className={style.icon} />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Sidebar;
