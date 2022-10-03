import style from "./navigation-notification.module.css";
import Link from "next/link";

function NavigationNotification(props) {
	if (!props.text) {
		return;
	}
	if (props.link) {
		return (
			<div className={style.preheader}>
				<Link href={props.link}>
					<text className={style.text}>
						{props.text}
						{props.link && " →"}
					</text>
				</Link>
			</div>
		);
	}
	return (
		<div className={style.preheader}>
			<text className={style.text}>
				{props.text}
				{props.link && "→"}
			</text>
		</div>
	);
}

export default NavigationNotification;
