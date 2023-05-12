import style from "./styles/Landscape.module.css";
import Logo from "./Logo";

export default function Landscape() {
	return (
		<div className={style.landscape}>
			<div className={style.logo}>
				<Logo color="black" />
			</div>
			<div className={style.warning}>
				<h1>Please rotate your device. </h1>
				<h2>Landscape mode is not supported.</h2>
			</div>
		</div>
	);
}
