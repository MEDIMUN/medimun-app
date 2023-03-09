import { useState, useContext, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import AppContext from "../../context/Navigation";
import { IoSettings } from "react-icons/io5";
import {
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	MenuItemOption,
	MenuGroup,
	MenuOptionGroup,
	MenuDivider,
} from "@chakra-ui/react";
import style from "./sidebar.module.css";
import { useRouter } from "next/router";

import { Navbar, Spacer, User } from "@nextui-org/react";
import SidebarUsersButton from "./button/button";
import { Button } from "@chakra-ui/react";
import { GrFormClose as IoCloseCircleOutline } from "react-icons/gr";

import {
	UserIcon,
	CommitteesIcon,
	ApplicationsIcon,
	ConferenceIcon,
	AnnouncementsIcon,
	MessagesIcon,
	ProgrammeIcon,
	EmailerIcon,
	TasksIcon,
	HomeIcon,
} from "./icons";
import Logo from "../../../common/branding/logo/main";

function Sidebar(props) {
	const router = useRouter();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	function toggleSidebar() {
		setSidebarOpen(!sidebarOpen);
	}
	const { data: session, status } = useSession();

	let username;
	if (!session) {
		username = " ";
	} else {
		username =
			(session.user.displayName || session.user.officialName) +
			" " +
			(session.user.displaySurname || session.user.officialSurname);
	}

	function shorten(str, n) {
		return str.length > n ? str.slice(0, n - 1) + "..." : str;
	}

	function logOutHandler() {
		signOut({ callbackUrl: "/" });
	}
	const setSidebar = props.setSidebar;

	const name = props.name;
	return (
		<div className={style.sidebar}>
			<div className={style.one}>
				<div className={style.logo}>
					<div className={style.closeButtonWrapper}>
						<IoCloseCircleOutline onClick={() => setSidebar(false)} className={style.closeButton} />
					</div>
					<Logo color="blue" width={136} height={34} />
				</div>
				<Spacer y={0.5} />

				<SidebarUsersButton text={"Home"} href={"/"} icon={<HomeIcon className={style.icon} />} />

				{session && session.user.role !== 0 ? (
					<SidebarUsersButton
						text={"My Committee"}
						href={"/my-committee"}
						icon={<CommitteesIcon className={style.icon} />}
					/>
				) : null}

				<Spacer y={1} />

				<SidebarUsersButton
					text={"Announcements"}
					href={"/announcements"}
					icon={<AnnouncementsIcon className={style.icon} />}
				/>

				{session && session.user.role !== "User" ? (
					<SidebarUsersButton text={"Tasks"} href={"/app/tasks"} icon={<TasksIcon className={style.icon} />} />
				) : null}
				<SidebarUsersButton text={"Schedule"} href={"/programme"} icon={<ProgrammeIcon className={style.icon} />} />
				<Spacer y={1} />
				<SidebarUsersButton text={"Email"} href={"/email"} icon={<EmailerIcon className={style.icon} />} />
				<Spacer y={1} />
				<SidebarUsersButton text={"Users"} href={"/users"} icon={<UserIcon className={style.icon} />} />
				<Spacer y={1} />
				<SidebarUsersButton text={"Committees"} href={"/committees"} icon={<CommitteesIcon className={style.icon} />} />
				<SidebarUsersButton text={"Teams"} href={"/committees"} icon={<CommitteesIcon className={style.icon} />} />
				{/* 
						<SidebarUsersButton
					  disabled
					  text={"Applications"}
					  href={"/app/applications"}
					  icon={<ApplicationsIcon className={style.icon} />}
				    />
					*/}
				<Spacer y={1} />
				<SidebarUsersButton text={"Sessions"} href={"/sessions"} icon={<ConferenceIcon className={style.icon} />} />
			</div>
			<div className={style.two}>
				{sidebarOpen && (
					<div className={style.userOptions}>
						<Button onClick={() => router.push("/account")}>Account Setting</Button>
						<Button onClick={() => window.open("https://forms.gle/GKSHK21Ej7QE2ASs9", "_blank")}>Give Feedback</Button>
						<Button onClick={logOutHandler}>Sign Out</Button>
					</div>
				)}

				<Button _hover={{}} onClick={toggleSidebar} backgroundColor="transparent">
					<div className={style.optionsmenu}>
						<User
							css={{ paddingLeft: "0px" }}
							src="https://avatars.githubusercontent.com/u/90158764?v=4"
							name={shorten(username, 18)}
							description={session ? session.user.roles[0].role : "Applicant"}
						/>
						<div className={style.settingsIconHolder}>
							<IoSettings width="40px" height="40px" className={style.settingsIcon} />
						</div>
					</div>
				</Button>
			</div>
		</div>
	);
}

export default Sidebar;
