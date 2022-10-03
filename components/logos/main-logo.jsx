import Image from "next/future/image";
import Link from "next/link";
import style from "./main-logo.module.css";

function Logo(props) {
	return (
		<div>
			<Link href="/">
				<a>
					<Image
						className={style.logo}
						src={`/logos/logo-${props.color}.svg`} //use theme provider API
						alt="MEDIMUN Logo"
						width={3235}
						height={769}
					/>
				</a>
			</Link>
		</div>
	);
}

export default Logo;
