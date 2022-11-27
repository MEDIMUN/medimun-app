import Image from "next/image";
import Link from "next/link";

import style from "./main.module.css";

function Logo(props) {
	return (
		<div>
			<Link href="/">
				<Image
					className={style.logo}
					src={`/logos/logo-${props.color}.svg`} //use theme provider API
					alt="MEDIMUN Logo"
					width={props.width || 3235}
					height={props.width || 769}
				/>
			</Link>
		</div>
	);
}

export default Logo;
