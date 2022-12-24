import Link from "next/link";
import { useRouter } from "next/router";
import { Text } from "@chakra-ui/react";

import style from "./button.module.css";

export default function SidebarUsersButton(props) {
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
	};

	if (pageMap[router.pathname] === props.text) {
		return (
			<div>
				<Link href={props.href}>
					<div className={style.sidebarSelectedItem}>
						<div className={style.iconWrapper}>{props.icon}</div>
						<Text className={style.text}>{props.text}</Text>
					</div>
				</Link>
			</div>
		);
	}

	return (
		<div>
			<Link href={props.href}>
				<div className={style.sidebarItem}>
					<div className={style.iconWrapper}>{props.icon}</div>
					<Text className={style.text}>{props.text}</Text>
				</div>
			</Link>
		</div>
	);
}
