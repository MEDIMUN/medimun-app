import RedLogo from "@public/assets/branding/logos/logo-medired.svg";
import BlackLogo from "@public/assets/branding/logos/logo-black.svg";
import WhiteLogo from "@public/assets/branding/logos/logo-white.svg";

import Image from "next/image";
import style from "./Logo.module.css";

export default function Logo({ color = "white", quality = 75 }) {
	switch (color) {
		case "red":
			return <Image className={style.logo} quality={quality} src={RedLogo} alt="MEDIMUN Logo" fill />;
		case "black":
			return <Image className={style.logo} quality={quality} src={BlackLogo} alt="MEDIMUN Logo" fill />;
		case "white":
			return <Image className={style.logo} quality={quality} src={WhiteLogo} alt="MEDIMUN Logo" fill />;
	}
}
