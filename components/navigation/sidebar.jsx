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
import { Button, Spacer, Text } from "@nextui-org/react";
import style from "./sidebar.module.css";
import Logo from "../logos/main-logo";
import SidebarUsersButton from "../elements/buttons/sidebar-button";

function Sidebar() {
	let buttonColor = "#ff8028";

	return (
		<div className={style.sidebar}>
			<div className={style.logo}>
				<Logo color={"white"} />
				<Spacer x={1} />
				<div className={style.divider}></div>
				<div className={style.fdr}>
					<div>
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
				</div>
			</div>
		</div>
	);
}

export default Sidebar;
