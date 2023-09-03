"use client";

import { useEffect, useState } from "react";
import style from "./styles/Navbar.module.css";
import Logo from "./Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiOutlineMenu } from "react-icons/ai";
import LoginButton from "./LoginButton";
import Menu from "./Menu";

export default function Navbar({ children }) {
	const pageColors = {
		"/": "black",
		"/home": "black",
		"/medibook": "black",
		"/login": "white",
		"/register": "white",
		"/signup": "white",
		"/loginhelp": "black",
	};

	const hideMenu = ["/loginhelp", "/login", "/register", "/signup"];
	const hideLogo = ["/loginhelp", "/register"];

	const [isTransparent, setIsTransparent] = useState(true);
	const [currentColor, setCurrentColor] = useState("black");
	const [isVisable, setIsVisable] = useState(false);

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
		handleNavigation();
	}, [pathname]);

	async function handleNavigation() {
		setCurrentColor(pageColors[pathname]);
	}

	const handleMenu = () => {
		setIsVisable(!isVisable);
	};

	if (hideMenu.includes(pathname) && hideLogo.includes(pathname)) return null;

	return (
		<>
			<header className={style.header}>
				<nav className={isTransparent ? style.transparentNav : style.opaqueNav}>
					{!hideLogo.includes(pathname) && (
						<div className={style.branding}>
							<Link href="/#">
								<div className={style.logo}>
									<Logo color={isTransparent ? currentColor : "white"} quality={100} />
								</div>
							</Link>
						</div>
					)}
					{!hideMenu.includes(pathname) && (
						<>
							<div className={style.middle} aria-hidden />
							<div className={style.options}>
								<LoginButton />
								<div onClick={handleMenu} className={style.burger}>
									<AiOutlineMenu className={style.icon} /> <span className={style.text}>Menu</span>
								</div>
							</div>
						</>
					)}
				</nav>
			</header>
			<Menu props={{ isVisable, setIsVisable }} className="fixed" />
		</>
	);
}
