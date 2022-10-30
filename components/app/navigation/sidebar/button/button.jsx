import Link from "next/link";

import style from "./button.module.css";

export default function SidebarUsersButton(props) {
	return (
		<div>
			<Link href={props.href}>
				<a>
					<div className={style.sidebarItem}>
						<div className={style.iconWrapper}>{props.icon}</div>
						<text className={style.text}>{props.text}</text>
					</div>
				</a>
			</Link>
		</div>
	);
}
