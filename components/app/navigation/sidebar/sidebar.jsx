import { useState, useContext, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import AppContext from "../../context/Navigation";

import style from "./sidebar.module.css";

import { Button, Spacer, User } from "@nextui-org/react";
import SidebarUsersButton from "./button/button";

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

function Sidebar(props) {
	const AppCtx = useContext(AppContext);

	const memoUserOptions = useMemo(() => {
		return (
			<div
				key={"useroptions"}
				className={style.userActions}>
				<Button
					onPress={logOutHandler}
					flat
					size="sm"
					color="error">
					Sign Out
				</Button>
				<Spacer y={0.5} />
				<Button
					css={{ width: "50px" }}
					size="sm"
					flat>
					Account
				</Button>
			</div>
		);
	}, [AppCtx.sidebarOptionsVisibility]);

	function toggleSidebar() {
		AppCtx.toggleSidebarOptionsVisibility();
	}
	const { data: session, status } = useSession();

	//const loading = status === "loading";

	function logOutHandler() {
		signOut({ callbackUrl: "/login" });
	}

	const name = props.name;
	return (
		<div className={style.sidebar}>
			<div className={style.one}>
				{session.user.role >= 0 ? (
					<SidebarUsersButton
						text={"Home"}
						href={"/app"}
						icon={<HomeIcon className={style.icon} />}
					/>
				) : null}

				{session.user.role !== 0 ? (
					<SidebarUsersButton
						text={"My Committee"}
						href={"/app/my-committee"}
						icon={<CommitteesIcon className={style.icon} />}
					/>
				) : null}

				<Spacer y={1} />

				<SidebarUsersButton
					text={"Announcements"}
					href={"/app/announcements"}
					icon={<AnnouncementsIcon className={style.icon} />}
				/>

				{session.user.role !== "User" ? (
					<SidebarUsersButton
						text={"Tasks"}
						href={"/app/tasks"}
						icon={<TasksIcon className={style.icon} />}
					/>
				) : null}

				<SidebarUsersButton
					text={"Schedule"}
					href={"/app/schedule"}
					icon={<ProgrammeIcon className={style.icon} />}
				/>

				<Spacer y={1} />

				<SidebarUsersButton
					text={"Messages"}
					href={"/app/messages"}
					icon={<MessagesIcon className={style.icon} />}
				/>
				<SidebarUsersButton
					text={"Email"}
					href={"/app/email"}
					icon={<EmailerIcon className={style.icon} />}
				/>

				<Spacer y={1} />

				<SidebarUsersButton
					text={"Users"}
					href={"/app/users"}
					icon={<UserIcon className={style.icon} />}
				/>
				<SidebarUsersButton
					text={"Committees"}
					href={"/app/committees"}
					icon={<CommitteesIcon className={style.icon} />}
				/>
				<SidebarUsersButton
					text={"Applications"}
					href={"/app/applications"}
					icon={<ApplicationsIcon className={style.icon} />}
				/>

				<Spacer y={1} />

				<SidebarUsersButton
					text={"Confence"}
					href={"/app/conference"}
					icon={<ConferenceIcon className={style.icon} />}
				/>
			</div>
			<div className={style.spacer}></div>
			<div className={style.two}>
				{AppCtx.sidebarOptionsVisibility && memoUserOptions}
				<Spacer y={1} />
				<User
					onClick={toggleSidebar}
					squared
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
