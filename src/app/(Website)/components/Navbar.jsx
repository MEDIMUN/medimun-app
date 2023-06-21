"use client";

import { useEffect, useState } from "react";
import style from "./styles/Navbar.module.css";
import Logo from "./Logo";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { AiOutlineMenu } from "react-icons/ai";
import LoginButton from "./LoginButton";
import Menu from "./Menu";

export default function Navbar({ children }) {
	const [isTransparent, setIsTransparent] = useState(true);
	const [currentColor, setCurrentColor] = useState("black");
	const [isVisable, setIsVisable] = useState(false);

	const router = useRouter();
	const pathname = usePathname();

	let previousOffset = 0;
	function handleScroll() {
		const offset = window.scrollY;
		offset < previousOffset && offset != 0 ? setIsTransparent(false) : setIsTransparent(true);
		offset == 0 ? setIsTransparent(true) : null;
		previousOffset = offset;
	}
	useEffect(() => {
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	useEffect(() => {
		handleLogoColor();
	}, [pathname]);

	async function handleLogoColor() {
		const pageColors = {
			"/": "black",
			"/home": "black",
			"/medibook": "black",
			"/login": "black",
			"/register": "white",
			"/signup": "black",
		};
		setCurrentColor(pageColors[pathname]);
	}

	const handleMenu = () => {
		setIsVisable(!isVisable);
	};

	return (
		<>
			<header className={style.header}>
				<nav className={isTransparent ? style.transparentNav : style.opaqueNav}>
					<div className={style.branding}>
						<Link href="/">
							<div className={style.logo}>
								<Logo color={isTransparent ? currentColor : "white"} quality={100} />
							</div>
						</Link>
					</div>
					<div className={style.middle} aria-hidden></div>
					<div className={style.options}>
						<LoginButton />
						<div onClick={handleMenu} className={style.burger}>
							<AiOutlineMenu className={style.icon} /> <span className={style.text}>Menu</span>
						</div>
					</div>
				</nav>
			</header>
			<Menu props={{ isVisable, setIsVisable }} className="fixed" />
		</>
	);
}
