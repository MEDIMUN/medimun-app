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
import image5 from "@/public/placeholders/the-english-school-2.jpg";
import image6 from "@/public/placeholders/delegates-2.jpg";
import image7 from "@/public/placeholders/delegates-2.jpg";

const links = [
	{ pathname: "/about", src: image1, alt: "About" },
	{ pathname: "/news", src: image7, alt: "News" },
	{ pathname: "/topics", src: image3, alt: "Topics" },
	{ pathname: "/sessions", src: image4, alt: "Sessions" },
	{ pathname: "/events", src: image1, alt: "Events" },
	{ pathname: "/resources", src: image5, alt: "Resources" },
	{ pathname: "/announcements", src: image2, alt: "Announcements" },
	{ pathname: "/contact", src: image6, alt: "Contact" },
].sort((a, b) => (a.alt.length > b.alt.length ? 1 : -1));

const quickActions = [
	{ href: "/login", alt: "Login" },
	{ href: "/signup", alt: "Sign Up" },
	{ href: "/verify", alt: "Document Verification" },
	{ href: "/donate", alt: "Donate" },
];

const CloseIcon = () => {
	return (
		<svg
			viewBox="0 0 24 24"
			width="24"
			height="24"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			fill="none"
			shapeRendering="geometricPrecision">
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
			<li onMouseEnter={handleMouseEnter} className="z-[11] w-fit">
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
	return (
		<div className="z-5 absolute ml-4 mt-40 grid max-h-min w-fit grid-cols-1 gap-2 overflow-y-auto font-[canela] text-[35px] font-[40] text-white md:ml-10 md:text-[48px]">
			{menuItems}
		</div>
	);
};

export default function Menu({ props }) {
	const { isVisable, setIsVisable } = props;
	const pathname = usePathname();
	const [isHovered, setIsHovered] = useState("/about");
	const [isBlack, setIsBlack] = useState(false);

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
		<menu>
			<div className={`fixed left-0 top-0 z-[250] h-[100dvh] w-full bg-black duration-500 ${!isVisable && "-translate-y-[100%]"}`}>
				<div>
					<Link href="/">
						<div className="bg-red absolute left-4 top-4 z-20 w-[200px] md:left-10 md:top-10">
							<Logo color="black" quality={100} />
						</div>
					</Link>
					<div
						className="absolute right-4 top-4 z-[12] cursor-pointer rounded-2xl border-[1px] border-white p-2 text-white shadow-white duration-200 md:right-10 md:top-10 md:shadow-lg md:hover:rounded-3xl md:hover:bg-white md:hover:text-black"
						onClick={() => setIsVisable(false)}>
						<CloseIcon />
					</div>
				</div>
				<MenuItems pathname={pathname} links={links} setIsBlack={setIsBlackOptimized} isHovered={isHovered} setIsHovered={setIsHoveredOptimized} />
				<Image alt={hoveredLink.alt} src={hoveredLink.src} className="-z-10 h-[calc(100%)] w-full -translate-y-[82px] object-cover object-left duration-300 md:ml-[0px]" />
				<div className={`absolute left-0 top-0 z-10 h-[calc(100%-80px)] w-full duration-300 md:ml-[0px] ${isBlack && "!bg-black"}` + " " + style.vignette}></div>
				<div className="absolute bottom-0 z-[300] h-[80px] w-full min-w-full overflow-x-auto border-t-[1px] border-[rgb(122,122,122)] px-4 md:gap-10 md:px-10 ">
					<ul className="flex h-full w-fit min-w-fit flex-row gap-10 overflow-x-auto">
						{quickActions.map((action) => (
							<li key={action.href + Math.random()} className="my-auto px-3">
								<Link href={action.href}>
									<p className="w-max min-w-fit rounded-3xl text-center font-[canela] text-[20px] font-[40] text-white duration-200 md:text-[24px] md:hover:bg-white md:hover:px-6 md:hover:text-[var(--medired)]">
										{action.alt}
									</p>
								</Link>
							</li>
						))}
					</ul>
				</div>
			</div>
		</menu>
	);
}
