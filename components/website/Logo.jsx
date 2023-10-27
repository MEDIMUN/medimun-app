import RedLogo from "@public/assets/branding/logos/logo-medired.svg";
import BlackLogo from "@public/assets/branding/logos/logo-black.svg";
import WhiteLogo from "@public/assets/branding/logos/logo-white.svg";
import GrayLogo from "@public/assets/branding/logos/logo-gray.svg";

import Image from "next/image";
import style from "./styles/Logo.module.css";

export default function Logo({ color = "white", quality = 75, className }) {
	switch (color) {
		case "red":
			return <Image priority className={style.logo + " " + className} quality={quality} src={RedLogo} alt="MEDIMUN Logo" />;
		case "black":
			return <Image priority className={style.logo + " " + className} quality={quality} src={BlackLogo} alt="MEDIMUN Logo" />;
		case "white":
			return <Image priority className={style.logo + " " + className} quality={quality} src={WhiteLogo} alt="MEDIMUN Logo" />;
		case "gray":
			return <Image priority className={style.logo + " " + className} quality={quality} src={GrayLogo} alt="MEDIMUN Logo" />;
	}
}
