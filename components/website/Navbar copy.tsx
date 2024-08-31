"use client";

import { useEffect, useState } from "react";
import style from "./styles/Navbar.module.css";
import Logo from "./Logo.jsx";
import { Link } from "@nextui-org/link";
import { usePathname } from "next/navigation";
import { AiOutlineMenu } from "react-icons/ai";
import LoginButton from "./LoginButton";
import Menu from "./Menu";
import { useSession } from "next-auth/react";
import { Button, ButtonGroup } from "@nextui-org/button";
import RedLogo from "@/public/assets/branding/logos/logo-medired.svg";
import BlackLogo from "@/public/assets/branding/logos/logo-black.svg";
import WhiteLogo from "@/public/assets/branding/logos/logo-white.svg";
import GrayLogo from "@/public/assets/branding/logos/logo-gray.svg";
import { ChevronDown, Lock, Activity, Flash, Server, TagUser, Scale } from "./Icons.jsx";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem } from "@nextui-org/dropdown";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from "@nextui-org/navbar";
import Image from "next/image";

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
};

const hideMenu = ["/loginhelp", "/signup", "/login"];
const hideLogo = ["/loginhelp", "/login"];
const hideNotification = ["/login", "/signup", "/register"];

export function WebsiteNavbar2() {
	const icons = {
		chevron: <ChevronDown fill="currentColor" size={16} />,
		scale: <Scale className="text-warning" fill="currentColor" size={30} />,
		lock: <Lock className="text-success" fill="currentColor" size={30} />,
		activity: <Activity className="text-secondary" fill="currentColor" size={30} />,
		flash: <Flash className="text-primary" fill="currentColor" size={30} />,
		server: <Server className="text-success" fill="currentColor" size={30} />,
		user: <TagUser className="text-danger" fill="currentColor" size={30} />,
	};
	return (
		<Navbar
			className=""
			aclassNames={{ base: "fixed backdrop-filter-none bg-transparent" }}
			isBlurred={false}
			color=""
			height="5rem"
			shouldHideOnScroll
			maxWidth="full">
			<NavbarBrand>
				<div>
					<Image src={WhiteLogo} alt="MediBook" width={175} height={40} />
				</div>
			</NavbarBrand>
			<NavbarContent className="hidden gap-4 sm:flex" justify="center">
				<Dropdown>
					<NavbarItem>
						<DropdownTrigger>
							<Button
								disableRipple
								className="bg-transparent p-0 data-[hover=true]:bg-transparent"
								endContent={icons.chevron}
								radius="sm"
								variant="light">
								Features
							</Button>
						</DropdownTrigger>
					</NavbarItem>
					<DropdownMenu
						aria-label="ACME features"
						className="w-[340px]"
						itemClasses={{
							base: "gap-4",
						}}>
						<DropdownItem
							key="autoscaling"
							description="ACME scales apps to meet user demand, automagically, based on load."
							startContent={icons.scale}>
							Autoscaling
						</DropdownItem>
						<DropdownItem
							key="usage_metrics"
							description="Real-time metrics to debug issues. Slow query added? We’ll show you exactly where."
							startContent={icons.activity}>
							Usage Metrics
						</DropdownItem>
						<DropdownItem
							key="production_ready"
							description="ACME runs on ACME, join us and others serving requests at web scale."
							startContent={icons.flash}>
							Production Ready
						</DropdownItem>
						<DropdownItem
							key="99_uptime"
							description="Applications stay on the grid with high availability and high uptime guarantees."
							startContent={icons.server}>
							+99% Uptime
						</DropdownItem>
						<DropdownItem
							key="supreme_support"
							description="Overcome any challenge with a supporting team ready to respond."
							startContent={icons.user}>
							+Supreme Support
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
				<NavbarItem isActive>
					<Link href="#" aria-current="page">
						Customers
					</Link>
				</NavbarItem>
				<NavbarItem>
					<Link color="foreground" href="#">
						Integrations
					</Link>
				</NavbarItem>
			</NavbarContent>
			<NavbarContent justify="end">
				<NavbarItem className="hidden lg:flex">
					<Link href="#">Login</Link>
				</NavbarItem>
				<NavbarItem>
					<Button as={Link} color="primary" href="#" variant="flat">
						Sign Up
					</Button>
				</NavbarItem>
			</NavbarContent>
		</Navbar>
	);
}

export function WebsiteNavbar({ children }) {
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

	const notification = {
		atext: "Website is being tested. You may encounter issues. Some links may temporarily not work.",
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

	if (hideMenu.includes(pathname) && hideLogo.includes(pathname)) return null;

	return (
		<>
			{!hideNotification.includes(pathname) && notification.text && (
				<div className="relative z-[10000000] flex w-full justify-center bg-[#dfdfdf] py-1 font-[Montserrat] text-sm text-black">
					<span className="my-auto inline-block text-center">
						{notification.text.trim() + " "}
						{notification.linkText && (
							<Link showAnchorIcon target="_blank" href={notification.link}>
								{notification.linkText.trim().toLowerCase()}
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
