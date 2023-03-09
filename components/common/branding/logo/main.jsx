import Image from "next/image";
import Link from "next/link";

import style from "./main.module.css";

function Logo(props) {
	let color;

	if (props.color == "#FFFFFF" || props.color == "var(--navbar-text-color)") {
		color = "white";
	} else if (props.color == "mediblue") {
		color = "blue";
	} else {
		color = props.color;
	}

	return (
		<div className={style.logo}>
			<Link href="/">
				<Image
					src={`/logos/logo-${color}.svg`} //use theme provider API
					alt="MEDIMUN Logo"
					width={props.width || 3235}
					height={props.width || 769}
				/>
			</Link>
		</div>
	);
}

export default Logo;
