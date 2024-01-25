"use client";

import { NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import Link from "next/link";
import { useState, useEffect, Fragment } from "react";
import MediBookBadge from "@public/assets/branding/badges/medibook-badge-white-1.svg";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ScrollShadow } from "@nextui-org/react";

export default function SubMenu(props) {
	const pathname = usePathname();

	const linkStyle = "m-[5px] h-8 text-[#666666] font-light inline-flex items-center justify-center rounded-lg text-sm transition-colors focus:outline-none focus:bg-accent focus:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none bg-background hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent/50 data-[active]:bg-accent/50 py-2 px-1.5 group w-max";
	const [sticky, setSticky] = useState(false);

	const handleScroll = () => {
		window.scrollY > 50 ? setSticky(true) : setSticky(false);
	};

	useEffect(() => {
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	if (props.hide) return;
	if (!props.menuItems) return;

	return (
		<>
			{sticky && <div className="h-12"></div>}
			<div className={`${sticky && "fixed left-0 right-0 top-0 bg-white"} z-50 flex h-[48px] w-full justify-start border-[#EAEAEA] px-2`}>
				<NavigationMenu className="flex w-[100%] justify-start overflow-x-auto">
					<NavigationMenuList>
						{sticky && (
							<>
								<NavigationMenuItem className={`${sticky && "fixed left-0 bg-white pl-3"}`}>
									<Link href="/medibook" legacyBehavior passHref>
										<NavigationMenuLink className={linkStyle}>
											<Image alt="MediBook Logo" className="min-w-[33px] max-w-[35px] grayscale hover:filter-none" src={MediBookBadge} />
										</NavigationMenuLink>
									</Link>
								</NavigationMenuItem>
								<div className="z-[-1] min-h-[2px] min-w-[51px] max-w-[35px]" />
							</>
						)}
						{props.menuItems.map((item) => {
							return (
								<NavigationMenuItem key={item.href}>
									<Link href={item.href} legacyBehavior passHref>
										<NavigationMenuLink className={linkStyle + ` ${pathname == item.href && "bg-gradient-to-r from-gray-700 via-gray-900 to-black px-4 !text-white"}`}>{item.title}</NavigationMenuLink>
									</Link>
								</NavigationMenuItem>
							);
						})}
					</NavigationMenuList>
				</NavigationMenu>
			</div>
		</>
	);
}
