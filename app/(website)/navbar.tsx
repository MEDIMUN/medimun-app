"use client";
import Image from "next/image";
import WhiteLogo from "@/public/assets/branding/logos/logo-white.svg";
import BlackLogo from "@/public/assets/branding/logos/logo-black.svg";

import { useEffect, useState } from "react";
import {
	Dialog,
	DialogPanel,
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
	Popover,
	PopoverButton,
	PopoverGroup,
	PopoverPanel,
} from "@headlessui/react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { usePathname } from "next/navigation";
import { getOrdinal } from "@/lib/get-ordinal";
import { FastLink } from "@/components/fast-link";
import { ChevronDown, Folder, Hash, Megaphone, Menu, X } from "lucide-react";

const products = [
	{
		name: "Sessions",
		description: "Explore all the sessions of the conference and view their details",
		href: "/sessions",
		icon: Hash,
	},
	{
		name: "Resources",
		description: "Speak directly to your customers with our engagement tool",
		href: "/resources",
		icon: Folder,
	},
	{
		name: "Announcements",
		description: "Announcements from the conference organizers",
		href: "/announcements",
		icon: Megaphone,
	},
];

const callsToAction = [
	/* { name: "Watch demo", href: "#", icon: PlayCircleIcon },
	{ name: "Contact sales", href: "#", icon: PhoneIcon },
	{ name: "View all products", href: "#", icon: RectangleGroupIcon }, */
];

const whitepages = /*  ["/resources", "/announcements", "/blog", "/sessions", "/about"]; */ ["/shop"];

const hiddenPathnames = ["/login", "/login/help", "/reset-password", "/verify-email", "/signup"];

export function WebsiteNavbar({ selectedSession }) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const { data: authSession, status } = useSession();
	const pathname = usePathname();

	let isWhite = whitepages.includes(pathname);
	if (!pathname.includes("/medibook") && pathname.includes("/announcements")) isWhite = true;
	isWhite = true;

	const ordinal = getOrdinal(selectedSession?.numberInteger);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (pathname.includes("/login/help") || !mounted) return null;

	if (!hiddenPathnames.includes(pathname))
		return (
			<header className="absolute isolate z-10 w-full font-[Gilroy]">
				<nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
					<div className="flex lg:flex-1">
						<FastLink prefetch={true} href={status === "authenticated" ? "/home" : "/"} className="-m-1.5 p-1.5">
							<span className="sr-only">MEDIMUN</span>
							<Image className="h-12 w-auto" src={isWhite ? BlackLogo : WhiteLogo} alt="" />
						</FastLink>
					</div>
					<div className="flex lg:hidden">
						<button
							type="button"
							className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
							onClick={() => setMobileMenuOpen(true)}>
							<span className="sr-only">Open main menu</span>
							<Menu className="h-6 w-6" aria-hidden="true" />
						</button>
					</div>
					<PopoverGroup
						className={cn(
							"hidden rounded-full border bg-zinc-100/60 px-6 py-2 shadow-md lg:flex lg:gap-x-12",
							isWhite && "border-zinc-700 bg-black"
						)}>
						<Popover>
							<PopoverButton className={cn("flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900", isWhite && "text-white")}>
								Conference
								<ChevronDown className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
							</PopoverButton>

							<PopoverPanel
								transition
								className="absolute inset-x-0 top-0 -z-10 bg-white pt-14 shadow-lg ring-1 ring-gray-900/5 transition data-closed:-translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-leave:duration-150 data-enter:ease-out data-leave:ease-in">
								<div className="mx-auto grid max-w-7xl grid-cols-4 gap-x-4 px-6 py-10 lg:px-8 xl:gap-x-8">
									{products.map((item) => (
										<div key={item.name} className="group relative rounded-lg p-6 text-sm leading-6 hover:bg-gray-100">
											<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
												<item.icon slot="icon" className="h-6 w-6 text-gray-900 text-inherit" width={24} />
											</div>
											<FastLink href={item.href} className="mt-6 block font-semibold text-gray-900">
												{item.name}
												<span className="absolute inset-0" />
											</FastLink>
											<p className="mt-1 text-gray-600">{item.description}</p>
										</div>
									))}
									{selectedSession && (
										<div className="group relative rounded-lg bg-primary p-6 text-sm leading-6 text-white hover:bg-primary/80">
											<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-50 text-primary group-hover:bg-white">
												{selectedSession?.number}
												<sup>{ordinal}</sup>
											</div>
											<FastLink href={`/sessions/${selectedSession.number}`} className="mt-6 block font-semibold">
												{selectedSession?.number}
												{ordinal} Annual Session
												<span className="absolute inset-0" />
											</FastLink>
											<p className="mt-1 text-gray-100">Explore the latest session of the conference and view its details.</p>
										</div>
									)}
								</div>

								<div className="bg-gray-50">
									<div className="mx-auto max-w-7xl px-6 lg:px-8">
										<div className="grid grid-cols-3 divide-x divide-gray-900/5 border-x border-gray-900/5">
											{callsToAction.map((item) => (
												<FastLink
													prefetch={true}
													key={item.name}
													href={item.href}
													className="flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-100">
													<item.icon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
													{item.name}
												</FastLink>
											))}
										</div>
									</div>
								</div>
							</PopoverPanel>
						</Popover>

						<FastLink prefetch={true} href="/about" className={cn("text-sm font-semibold leading-6 text-gray-900", isWhite && "text-white")}>
							About
						</FastLink>
						{/* <FastLink href="/blog" className="text-sm font-semibold leading-6 text-gray-900">
							Blog
						</FastLink> */}
						<FastLink prefetch={true} href="/announcements" className={cn("text-sm font-semibold leading-6 text-gray-900", isWhite && "text-white")}>
							Announcements
						</FastLink>
						<FastLink
							prefetch={true}
							href="/policies/privacy"
							className={cn("text-sm font-semibold leading-6 text-gray-900", isWhite && "text-white")}>
							Policies
						</FastLink>
						<FastLink prefetch={true} href="/contact" className={cn("text-sm font-semibold leading-6 text-gray-900", isWhite && "text-white")}>
							Contact
						</FastLink>
					</PopoverGroup>
					<div className="hidden gap-4 lg:flex lg:flex-1 lg:justify-end">
						{status !== "authenticated" && (
							<FastLink href="/login" className="my-auto ml-auto text-sm font-semibold leading-6 text-gray-100">
								Log In <span aria-hidden="true">&rarr;</span>
							</FastLink>
						)}
						<FastLink
							href={status === "authenticated" ? "/medibook" : "/signup"}
							className={cn(
								"rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
								isWhite && "bg-white text-gray-900 hover:bg-gray-300"
							)}>
							{status === "authenticated" ? (authSession.user.isDisabled ? "Account Disabled" : "Go to MediBook") : "Sign Up"}
						</FastLink>
					</div>
				</nav>
				<Dialog className="lg:hidden font-[Montserrat]" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
					<div className="fixed inset-0 z-10" />
					<DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
						<div className="flex items-center justify-between">
							<FastLink href={status === "authenticated" ? "/home" : "/"} className="-m-1.5 p-1.5">
								<span className="sr-only">MEDIMUN</span>
								<Image className="h-12 w-auto" src={WhiteLogo} alt="" />
							</FastLink>
							<button type="button" className="-m-2.5 rounded-md p-2.5 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
								<span className="sr-only">Close menu</span>
								<X className="h-6 w-6" aria-hidden="true" />
							</button>
						</div>
						<div className="mt-6 flow-root">
							<div className="-my-6 divide-y divide-gray-500/10">
								<div className="space-y-2 py-6">
									<Disclosure as="div" className="-mx-3">
										{({ open }) => (
											<>
												<DisclosureButton className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
													Conference
													<ChevronDown className={cn(open ? "rotate-180" : "", "h-5 w-5 flex-none")} aria-hidden="true" />
												</DisclosureButton>
												<DisclosurePanel className="mt-2 space-y-2">
													{[...products, ...callsToAction].map((item) => (
														<DisclosureButton
															key={item.name}
															as="a"
															href={item.href}
															className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50">
															{item.name}
														</DisclosureButton>
													))}
												</DisclosurePanel>
											</>
										)}
									</Disclosure>
									<FastLink
										onClick={() => setMobileMenuOpen(false)}
										href="/about"
										className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
										About
									</FastLink>
									{/* <FastLink
										onClick={() => setMobileMenuOpen(false)}
										href="/blog"
										className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
										Blog
									</FastLink> */}
									<FastLink
										onClick={() => setMobileMenuOpen(false)}
										href="/announcements"
										className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
										Announcements
									</FastLink>
									<FastLink
										onClick={() => setMobileMenuOpen(false)}
										href="/policies/privacy"
										className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
										Policies
									</FastLink>
									<FastLink
										onClick={() => setMobileMenuOpen(false)}
										href="/contact"
										className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
										Contact
									</FastLink>
								</div>
								<div className="py-6">
									{status !== "authenticated" ? (
										<FastLink
											prefetch={true}
											href="/login"
											onClick={() => setMobileMenuOpen(false)}
											className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
											Log in
										</FastLink>
									) : (
										<FastLink
											prefetch={true}
											href="/medibook"
											onClick={() => setMobileMenuOpen(false)}
											className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
											Go To MediBook
										</FastLink>
									)}
								</div>
							</div>
						</div>
					</DialogPanel>
				</Dialog>
			</header>
		);
}
