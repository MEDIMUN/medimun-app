import style from "./sidebar-button.module.css";
import Link from "next/link";

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
