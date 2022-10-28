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
} from "../icons/sidebar-icons";
import { Button, Spacer, Text, User } from "@nextui-org/react";
import style from "./sidebar.module.css";
import Logo from "../logos/main-logo";
import SidebarUsersButton from "../elements/buttons/sidebar-button";
import { useSession, getSession } from "next-auth/react";

function Sidebar(props) {
	let buttonColor = "#ff8028";
	const { data: session, status } = useSession();
	const loading = status === "loading";
	console.log(session);
	function logOutHandler() {
		console.log("log out");
		signOut({ callbackUrl: "/login" });
	}
	const name = props.name;
	console.log(name);
	return (
		<div className={style.sidebar}>
			<div className={style.one}>
				<SidebarUsersButton
					text={"Home"}
					href={"/dashboard"}
					icon={<HomeIcon className={style.icon} />}
				/>
				<SidebarUsersButton
					text={"My Committee"}
					href={"/my-committee"}
					icon={<CommitteesIcon className={style.icon} />}
				/>

				<Spacer y={1} />

				<SidebarUsersButton
					text={"Announcements"}
					href={"/dashboard/announcements"}
					icon={<AnnouncementsIcon className={style.icon} />}
				/>
				<SidebarUsersButton
					text={"Tasks"}
					href={"/dashboard/tasks"}
					icon={<TasksIcon className={style.icon} />}
				/>
				<SidebarUsersButton
					text={"Schedule"}
					href={"/dashboard/schedule"}
					icon={<ProgrammeIcon className={style.icon} />}
				/>

				<Spacer y={1} />

				<SidebarUsersButton
					text={"Messages"}
					href={"/dashboard/messages"}
					icon={<MessagesIcon className={style.icon} />}
				/>
				<SidebarUsersButton
					text={"Email"}
					href={"/dashboard/email"}
					icon={<EmailerIcon className={style.icon} />}
				/>

				<Spacer y={1} />

				<SidebarUsersButton
					text={"Users"}
					href={"/dashboard/users"}
					icon={<UserIcon className={style.icon} />}
				/>
				<SidebarUsersButton
					text={"Committees"}
					href={"/committees"}
					icon={<CommitteesIcon className={style.icon} />}
				/>
				<SidebarUsersButton
					text={"Applications"}
					href={"/applications"}
					icon={<ApplicationsIcon className={style.icon} />}
				/>

				<Spacer y={1} />

				<SidebarUsersButton
					text={"Confence"}
					href={"/conference"}
					icon={<ConferenceIcon className={style.icon} />}
				/>
			</div>
			<div className={style.spacer}></div>
			<div className={style.two}>
				<User
					bordered
					src="https://avatars.githubusercontent.com/u/90158764?v=4"
					name={(session.user.display_name || session.user.official_name) + " " + (session.user.display_surname || session.user.official_surname)}
					description={session.user.role || "User"}
				/>
			</div>
		</div>
	);
}

export default Sidebar;
