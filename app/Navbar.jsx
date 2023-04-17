"use client";

import { useEffect, useState } from "react";
import style from "./Navbar.module.css";
import Logo from "./Logo";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AiOutlineMenu, AiOutlineLogin } from "react-icons/ai";

export default function Navbar() {
	const [isTransparent, setIsTransparent] = useState(true);
	const { data: session } = useSession();
	const router = useRouter();
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

	return (
		<header className={style.header}>
			<nav className={isTransparent ? style.transparentNav : style.opaqueNav}>
				<div className={style.branding}>
					<Link href="/">
						<div className={style.logo}>
							<Logo color={isTransparent ? "black" : "white"} quality={100} />
						</div>
					</Link>
				</div>
				<div className={style.middle} aria-hidden></div>
				<div className={style.options}>
					<div onClick={() => router.push(`${session ? "/medibook" : "/login"}`)} className={style.login}>
						<AiOutlineLogin className={style.icon} />
						<span className={style.text}> {session ? "MediBook" : "Login"}</span>
					</div>
					<div className={style.burger}>
						<AiOutlineMenu className={style.icon} /> <span className={style.text}>Menu</span>
					</div>
				</div>
			</nav>
		</header>
	);
}
