"use client";

import { useEffect, useState } from "react";
import style from "./styles/Navbar.module.css";
import Logo from "./Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiOutlineMenu } from "react-icons/ai";
import LoginButton from "./LoginButton";
import Menu from "./Menu";
import { useSession } from "next-auth/react";

const pageColors = {
	"/": "red",
	"/home": "red",
	"/medibook": "black",
	"/login": "white",
	"/register": "black",
	"/signup": "white",
	"/loginhelp": "black",
	"/contact": "red",
	"/about": "red",
	"/announcements": "red",
	"/sessions": "red",
	"/privacy": "red",
	"/terms": "red",
	"/conduct": "red",
	"/resources": "red",
	"/medinews": "red",
};

const hideMenu = ["/loginhelp", "/signup"];
const hideLogo = ["/loginhelp"];
const hideNotification = ["/login", "/signup", "/register"];

export default function Navbar({ children }) {
	const pathname = usePathname();
	const [isTransparent, setIsTransparent] = useState(true);
	const [currentColor, setCurrentColor] = useState("black");
	const [isVisable, setIsVisable] = useState(false);
	const { data: session, status } = useSession();

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

	const notification = {
		t0ext: "Website is being tested. You may encounter issues. Some links may temporarily not work.",
		linkText: "Report",
		link: "https://forms.gle/eSFYucMmJbQzMyPa6",
	};

	useEffect(() => {
		if (isVisable) {
			document.body.style.overflow = "hidden";
			document.body.style.touchAction = "none";
			window.scrollTo(0, 0);
		} else {
			document.body.style.overflow = "scroll";
			document.body.style.touchAction = "auto";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isVisable]);

	return (
		<>
			{!hideNotification.includes(pathname) && notification.text && (
				<div className="flex w-full justify-center bg-[#dfdfdf] py-1 font-[Montserrat] text-sm capitalize text-black">
					<span className="my-auto inline-block text-center">
						{notification.text.trim().toLowerCase() + " "}
						{notification.linkText && (
							<Link className="rounded-2xl bg-medired px-2 py-[2px] capitalize text-white duration-200 hover:bg-white hover:text-medired" target="_blank" href={notification.link}>
								{notification.linkText.trim().toLowerCase() + " →"}
							</Link>
						)}
					</span>
				</div>
			)}
			<header className={style.header}>
				<nav className={isTransparent ? style.transparentNav : style.opaqueNav}>
					{!hideLogo.includes(pathname) && (
						<div className={style.branding}>
							<Link href={status == "loading" || status == "unauthenticated" ? "/" : "/home"}>
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
