import { useState, useContext, useMemo, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import AppContext from "@app-components/context/Navigation";
import { IoSettings } from "react-icons/io5";
import { Menu, MenuButton, MenuList, MenuItem, MenuItemOption, MenuGroup, MenuOptionGroup, MenuDivider } from "@chakra-ui/react";
import style from "./sidebar.module.css";
import { useRouter } from "next/router";
import Link from "next/link";
import { Text } from "@chakra-ui/react";
import { useFirstRender } from "@hooks/useFirstRender";
import useSWR from "swr";

import { Navbar, Spacer, User } from "@nextui-org/react";
import { Button, Select } from "@chakra-ui/react";
import { GrFormClose as IoCloseCircleOutline } from "react-icons/gr";
import { memo } from "react";

import { FcHome, FcBriefcase, FcSpeaker, FcTodoList, FcCalendar, FcAddressBook, FcPodiumWithSpeaker, FcConferenceCall, FcBusiness, FcAcceptDatabase, FcWorkflow, FcCollaboration, FcPortraitMode, FcExport, FcMenu } from "react-icons/fc";

import Logo from "@logo";

function Sidebar(props) {
	const router = useRouter();
	const firstRender = useFirstRender();

	const AvatarDetails = memo(function AvatarDetails({ picture, officialName, officialSurname, displayName, role }) {
		return <User css={{ paddingLeft: "0px" }} src={picture} name={shorten(`${displayName || officialName} ${!displayName ? officialSurname : ""}`, 15)} description={role} />;
	});

	const SidebarCtx = useContext(AppContext);
	const userData = SidebarCtx.userData;
	const setUserData = SidebarCtx.setUserData;

	const fetcher = (...args) => fetch(...args).then((res) => res.json());

	const { sessions, sessionsError } = useSWR("/api/sessions", fetcher);
	const { user, userError } = useSWR("/api/user", fetcher);

	const [sidebarOpen, setSidebarOpen] = useState(false);
	const allSessions = SidebarCtx.allSessions;

	const setSidebar = props.setSidebar;
	const sidebarVisibility = SidebarCtx.sidebarVisibility;
	const setAllSessions = SidebarCtx.setAllSessions;
	const selectedSession = SidebarCtx.selectedSession;
	const setSelectedSession = SidebarCtx.setSelectedSession;

	function toggleSidebar() {
		SidebarCtx.toggleSidebarVisibility();
	}

	useEffect(() => {
		fetch("/api/sessions")
			.then((res) => res.json())
			.then((data) => {
				setAllSessions(data);
			});
		/* 		fetch("/api/user")
			.then((res) => res.json())
			.then((data) => {
				setUserData(data);
			}); */
	}, []);

	const handleSessionChange = (event) => setSelectedSession(event.target.value);

	function SidebarUsersButton(props) {
		const router = useRouter();

		const pageMap = {
			"/": "Home",
			"/users": "Users",
			"/announcements": "Announcements",
			"/tasks": "Tasks",
			"/schedule": "Schedule",
			"/email": "Email",
			"/my-committee": "My Committee",
			"/": "Home",
			"/committees": "Committees",
			"/committee": "My Committee",
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

	function shorten(str, n) {
		return str.length > n ? str.slice(0, n - 1) + "..." : str;
	}

	function logOutHandler() {
		signOut({ callbackUrl: "/login" });
	}

	const name = props.name;
	return (
		<div className={sidebarVisibility ? style.sidebar : style.closedSidebar}>
			<div className={style.zero}>
				<div className={style.closeButtonWrapper}>
					<IoCloseCircleOutline onClick={toggleSidebar} className={style.closeButton} />
				</div>
				{sidebarVisibility && <Logo color="blue" width={136} height={34} />}
			</div>
			<ul className={style.one}>
				{sidebarVisibility && (
					<div className="fdr">
						<SidebarUsersButton text={"Session"} href={"/sessions"} icon={<FcWorkflow />} />
						<Spacer x={0.5} />
						<Select defaultValue={selectedSession} onChange={handleSessionChange}>
							{allSessions.map((session) => {
								return (
									<option value={session} key={session}>
										{session}
									</option>
								);
							})}
						</Select>
					</div>
				)}
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
					<SidebarUsersButton text={"Committees"} href={`/sessions/${selectedSession}/committees`} icon={<FcConferenceCall />} />
					<SidebarUsersButton text={"Departments"} href={`/sessions/${selectedSession}/departments`} icon={<FcBusiness />} />
				</div>
				<div>
					<SidebarUsersButton text={"Applications"} href={`/sessions/${selectedSession}/applications`} icon={<FcAcceptDatabase />} />
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
					{userData.userUpdate && <AvatarDetails picture="https://avatars.githubusercontent.com/u/90158764?v=4" officialName={userData.userUpdate.user.officialName} officialSurname={userData.userUpdate.user.officialSurname} displayName={userData.userUpdate.user.displayName} role={userData.userUpdate.highestCurrentRoleName} />}

					<div className={style.settingsIconHolder}>
						<Button
							className={style.settings}
							onClick={() => {
								setSidebarOpen(!sidebarOpen);
							}}>
							<FcMenu className={style.icon} />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Sidebar;
