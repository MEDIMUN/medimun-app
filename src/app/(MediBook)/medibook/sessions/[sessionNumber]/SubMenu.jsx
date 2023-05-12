"use client";

import { NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import Link from "next/link";
import { useState, useEffect, Fragment } from "react";
import MediBookBadge from "@public/assets/branding/badges/medibook-badge-white-1.svg";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function SubMenu() {
	const linkStyle = "m-[5px] h-8 text-[#666666] font-light inline-flex items-center justify-center rounded-md text-sm transition-colors focus:outline-none focus:bg-accent focus:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none bg-background hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent/50 data-[active]:bg-accent/50 py-2 px-1.5 group w-max";
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
	const pathname = usePathname();
	return (
		<div className={`${sticky && "fixed top-0 bg-white left-0 right-0 shadow-md"} px-2 h-[48px] w-full flex z-50 justify-start border-b-[1px] border-[#EAEAEA]`}>
			<NavigationMenu className="w-[100%] flex justify-start overflow-x-auto">
				<NavigationMenuList>
					{sticky && (
						<Fragment>
							<NavigationMenuItem className={`${sticky && "fixed bg-white left-0 pl-3"}`}>
								<Link href="/medibook" legacyBehavior passHref>
									<NavigationMenuLink className={linkStyle}>
										<Image className="min-w-[33px] max-w-[35px] grayscale hover:filter-none" src={MediBookBadge} />
									</NavigationMenuLink>
								</Link>
							</NavigationMenuItem>
							<div className="min-w-[51px] max-w-[35px] min-h-[2px] z-[-1]" />
						</Fragment>
					)}
					<NavigationMenuItem>
						<Link href="/medibook/sessions/" legacyBehavior passHref>
							<NavigationMenuLink className={linkStyle}>About</NavigationMenuLink>
						</Link>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<Link href={`${pathname}/topics`} legacyBehavior passHref>
							<NavigationMenuLink className={linkStyle}>Topics</NavigationMenuLink>
						</Link>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<Link href={`${pathname}/committees`} legacyBehavior passHref>
							<NavigationMenuLink className={linkStyle}>Committees</NavigationMenuLink>
						</Link>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<Link href={`${pathname}/departments`} legacyBehavior passHref>
							<NavigationMenuLink className={linkStyle}>Departments</NavigationMenuLink>
						</Link>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<Link href={`${pathname}/documents`} legacyBehavior passHref>
							<NavigationMenuLink className={linkStyle}>Documents</NavigationMenuLink>
						</Link>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<Link href="documents" legacyBehavior passHref>
							<NavigationMenuLink className={linkStyle}>Documents</NavigationMenuLink>
						</Link>
					</NavigationMenuItem>
					<NavigationMenuIndicator />
				</NavigationMenuList>
			</NavigationMenu>
		</div>
	);
}
