import s from "./ProfileBanner.module.css";

const getFlagEmoji = (countryCode = "UN") => String.fromCodePoint(...[...countryCode.toUpperCase()].map((x) => 0x1f1a5 + x.charCodeAt()));

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export default function ProfileBanner(props) {
	return (
		<div className={s.wrapper}>
			<div className={s.one}>
				<div className={s.avatar}></div>
			</div>
			<div className={s.two}>
				<h2 className={s.name}>{props.name ?? "I don't have a name"}</h2>
				<h3 className={s.role}>{props.role ?? "I don't have a role"}</h3>
				<div className={s.infoHolder}>
					<h4 className={s.info}>
						<strong className={s.emoji}>{getFlagEmoji(props.country) ?? "🌎"}</strong>
						{regionNames.of(props.country) ?? "Earth"}
					</h4>
					{props.school && (
						<h4 className={s.info}>
							<strong className={s.emoji}>🏫</strong>
							{props.school ?? "I didn't select a school yet"}
						</h4>
					)}

					{props.bestDelegate && (
						<h4 className={s.info}>
							<strong className={s.emoji}>🥇</strong>
							Best Delegate Award Winner
						</h4>
					)}
				</div>
			</div>
		</div>
	);
}
