import s from "./ProfileBanner.module.css";

export default function ProfileBanner(props) {
	return (
		<div className={s.wrapper}>
			<div className={s.one}>
				{" "}
				<div className={s.avatar}></div>
			</div>
			<div className={s.two}>
				<h2 className={s.name}>{props.name ?? "I don't have a name"}</h2>
				<h3 className={s.role}>{props.role ?? "I don't have a role"}</h3>
				<div className={s.infoHolder}>
					<h4 className={s.info}>🌎 {props.country ?? "Earth"}</h4>
					<h4 className={s.info}>🏫 {props.school ?? "I didn't select a school yet"}</h4>
					{props.bestDelegate && <h4 className={s.info}>🥇 Best Delegate Award Winner</h4>}
				</div>
			</div>
		</div>
	);
}
