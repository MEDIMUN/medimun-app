import { useEffect, useState, useMemo, Fragment, useCallback } from "react";
import React from "react";
import style from "./styles/Menu.module.css";
import Link from "next/link";
import Logo from "./Logo";
import { usePathname } from "next/navigation";
import Image from "next/image";
import image1 from "@/public/placeholders/delegates-2.jpg";
import image2 from "@/public/assets/delegates-indoors-2.jpg";
import image3 from "@/public/assets/delegates-indoors.jpg";
import image4 from "@/public/placeholders/the-english-school-1.jpg";
import image8 from "@/public/placeholders/shop.png";
import image5 from "@/public/placeholders/the-english-school-2.jpg";
import image6 from "@/public/placeholders/delegates-2.jpg";
import image7 from "@/public/placeholders/delegates-2.jpg";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarImage } from "../ui/avatar";

const links = [
	{ pathname: "/about", src: image1, alt: "About" },
	{ pathname: "/programme", src: image1, alt: "Programme" },
	{ pathname: "https://shop.medimun.org", src: image8, alt: "Merch Shop" },
	{ pathname: "/news", src: image7, alt: "News", hidden: true },
	{ pathname: "/register", src: image3, alt: "Register", hidden: true },
	{ pathname: "/sessions", src: image4, alt: "Sessions", hidden: true },
	{ pathname: "/resources", src: image5, alt: "Resources" },
	{ pathname: "/announcements", src: image2, alt: "Announcements" },
	{ pathname: "/medinews", src: image2, alt: "MediNews" },
]
	.sort((a, b) => (a.alt.length > b.alt.length ? 1 : -1))
	.filter((a) => !a.hidden);

const quickActions = [
	{ href: "/contact", alt: "Contact Us" },
	{ href: "/verify", alt: "Document Verification", hidden: true },
	{ href: "/donate", alt: "Donate", hidden: true },
].filter((a) => !a.hidden);

const CloseIcon = () => {
	return (
		<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" shapeRendering="geometricPrecision">
			<path d="M18 6L6 18" />
			<path d="M6 6l12 12" />
		</svg>
	);
};

const MenuLink = React.memo((props) => {
	const handleMouseEnter = useCallback(async () => {
		if (props?.href === props?.isHovered) return;
		props.setIsBlack(true);
		await new Promise((resolve) => setTimeout(resolve, 300));
		props.setIsHovered(props?.href);
		await new Promise((resolve) => setTimeout(resolve, 100));
		props.setIsBlack(false);
	}, [props]);

	return (
		<Fragment key={props?.children}>
			<li onMouseEnter={handleMouseEnter} className="z-[11] hidden h-min w-fit md:block">
				<Link href={props?.href || "#"}>
					<p className={style.animate + ` ${props?.href === props?.pathname && " !text-[var(--medired)]"}`}>{props?.children}</p>
				</Link>
			</li>
			<li className="z-[11] block h-min w-fit md:hidden">
				<Link href={props?.href || "#"}>
					<p className={style.animate + ` ${props?.href === props?.pathname && " !text-[var(--medired)]"}`}>{props?.children}</p>
				</Link>
			</li>
		</Fragment>
	);
});

const MenuItems = (props) => {
	const menuItems = useMemo(() => {
		return props.links.map((link) => (
			<MenuLink pathname={props.pathname} key={link.pathname} setIsBlack={props.setIsBlack} setIsHovered={props.setIsHovered} isHovered={props.isHovered} href={link.pathname}>
				{link.alt}
			</MenuLink>
		));
	}, [props.pathname]);
	return <div className="absolute ml-4 flex h-[100dvh] flex-col justify-center gap-2 text-[35px]  font-[40] md:ml-10 md:text-[48px]">{menuItems}</div>;
};

export default function Menu({ props }) {
	const { isVisable, setIsVisable } = props;
	const pathname = usePathname();
	const [isHovered, setIsHovered] = useState("/about");
	const [isBlack, setIsBlack] = useState(false);
	const { data: session, status } = useSession();

	const setIsBlackOptimized = useCallback((val) => setIsBlack(val), []);
	const setIsHoveredOptimized = useCallback((val) => setIsHovered(val), []);

	useEffect(() => {
		setIsVisable(false);
	}, [pathname]);

	const hoveredLink = useMemo(() => {
		const map = {};
		links.forEach((link) => {
			map[link.pathname] = link;
		});
		return map;
	}, [links])[isHovered];

	return (
		<menu className="font-[canela] text-white">
			<div className={`fixed left-0 top-0 z-[250] h-[100dvh] w-full bg-black duration-500 ${!isVisable && "-translate-y-[100%]"}`}>
				<div>
					<Link href="/">
						<div className="bg-red absolute left-4 top-4 z-20 w-[200px] md:left-10 md:top-10">
							<Logo color="black" quality={100} />
						</div>
					</Link>
					<div className="absolute right-4 top-4 z-[12] cursor-pointer rounded-2xl border-[1px] border-white p-2 shadow-white duration-200 md:right-10 md:top-10 md:shadow-lg md:hover:rounded-3xl md:hover:bg-white md:hover:text-black" onClick={() => setIsVisable(false)}>
						<CloseIcon />
					</div>
				</div>
				<MenuItems pathname={pathname} links={links} setIsBlack={setIsBlackOptimized} isHovered={isHovered} setIsHovered={setIsHoveredOptimized} />
				<Image alt={hoveredLink.alt} src={hoveredLink.src} className="object-middle -z-10 h-[calc(100%)] w-full -translate-y-[82px] object-cover duration-300 md:ml-[0px]" />
				<div className={`absolute left-0 top-0 z-10 h-[calc(100%-80px)] w-full duration-300 md:ml-[0px] ${isBlack && "!bg-black"}` + " " + style.vignette}></div>
				<div className="absolute bottom-0 z-[300] h-[80px] w-full min-w-full overflow-x-auto border-t-[1px] border-[rgb(122,122,122)] px-4 md:gap-10 md:px-10 ">
					<ul className="flex h-full w-fit min-w-fit flex-row gap-10 overflow-x-auto">
						{status == "loading" || status == "unauthenticated" ? (
							<>
								<li className="my-auto px-3">
									<Link href="/login">
										<p className="w-max min-w-fit rounded-3xl text-center text-[20px] font-[40] duration-200 md:text-[24px] md:hover:bg-white md:hover:px-6 md:hover:text-[var(--medired)]">Login</p>
									</Link>
								</li>
								<li className="my-auto px-3">
									<Link href="/signup">
										<p className="w-max min-w-fit rounded-3xl text-center text-[20px] font-[40] duration-200 md:text-[24px] md:hover:bg-white md:hover:px-6 md:hover:text-[var(--medired)]">Sign Up</p>
									</Link>
								</li>
							</>
						) : (
							<>
								<li className="my-auto px-3">
									<Link href="/medibook">
										<p className="w-max min-w-fit rounded-3xl text-center text-[20px] font-[40] duration-200 md:text-[24px] md:hover:bg-white md:hover:px-6 md:hover:text-[var(--medired)]">MediBook</p>
									</Link>
								</li>
								<li onClick={signOut} className="my-auto flex cursor-pointer px-3">
									<p className="w-max min-w-fit rounded-3xl text-center text-[20px] font-[40] duration-200 md:text-[24px] md:hover:bg-white md:hover:px-6 md:hover:text-[var(--medired)]">Log Out of {session.user.officialName || session.user.displayName}</p>
								</li>
							</>
						)}
						{quickActions.map((action) => (
							<li key={action.href + Math.random()} className="my-auto px-3">
								<Link href={action.href}>
									<p className="w-max min-w-fit rounded-3xl text-center text-[20px] font-[40] duration-200 md:text-[24px] md:hover:bg-white md:hover:px-6 md:hover:text-[var(--medired)]">{action.alt}</p>
								</Link>
							</li>
						))}
					</ul>
				</div>
			</div>
		</menu>
	);
}
