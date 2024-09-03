"use client";

import Image from "next/image";
import WhiteLogo from "@/public/assets/branding/logos/logo-white.svg";

import { useState } from "react";
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
import { Bars3Icon, ChartPieIcon, CursorArrowRaysIcon, FingerPrintIcon, SquaresPlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon, RectangleGroupIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useSession } from "next-auth/react";

const products = [
	{
		name: "Analytics",
		description: "Get a better understanding where your traffic is coming from",
		href: "#",
		icon: ChartPieIcon,
	},
	{
		name: "Engagement",
		description: "Speak directly to your customers with our engagement tool",
		href: "#",
		icon: CursorArrowRaysIcon,
	},
	{ name: "Security", description: "Your customers’ data will be safe and secure", href: "#", icon: FingerPrintIcon },
	{
		name: "Integrations",
		description: "Your customers’ data will be safe and secure",
		href: "#",
		icon: SquaresPlusIcon,
	},
];
const callsToAction = [
	{ name: "Watch demo", href: "#", icon: PlayCircleIcon },
	{ name: "Contact sales", href: "#", icon: PhoneIcon },
	{ name: "View all products", href: "#", icon: RectangleGroupIcon },
];

function classNames(...classes) {
	return classes.filter(Boolean).join(" ");
}

export function WebsiteNavbar() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { data: authSession, status } = useSession();

	return (
		<header className="absolute isolate z-10 w-full ">
			<nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
				<div className="flex lg:flex-1">
					<Link href={status === "authenticated" ? "/home" : "/"} className="-m-1.5 p-1.5">
						<span className="sr-only">MEDIMUN</span>
						<Image className="h-12 w-auto" src={WhiteLogo} alt="" />
					</Link>
				</div>
				<div className="flex lg:hidden">
					<button
						type="button"
						className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
						onClick={() => setMobileMenuOpen(true)}>
						<span className="sr-only">Open main menu</span>
						<Bars3Icon className="h-6 w-6" aria-hidden="true" />
					</button>
				</div>
				<PopoverGroup className="hidden rounded-full border bg-zinc-100/60 px-6 py-2 shadow-md lg:flex lg:gap-x-12">
					<Popover>
						<PopoverButton className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900">
							Conference
							<ChevronDownIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
						</PopoverButton>

						<PopoverPanel
							transition
							className="absolute inset-x-0 top-0 -z-10 bg-white pt-14 shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:-translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in">
							<div className="mx-auto grid max-w-7xl grid-cols-4 gap-x-4 px-6 py-10 lg:px-8 xl:gap-x-8">
								{products.map((item) => (
									<div key={item.name} className="group relative rounded-lg p-6 text-sm leading-6 hover:bg-gray-50">
										<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
											<item.icon className="h-6 w-6 text-gray-600 group-hover:text-indigo-600" aria-hidden="true" />
										</div>
										<a href={item.href} className="mt-6 block font-semibold text-gray-900">
											{item.name}
											<span className="absolute inset-0" />
										</a>
										<p className="mt-1 text-gray-600">{item.description}</p>
									</div>
								))}
							</div>
							<div className="bg-gray-50">
								<div className="mx-auto max-w-7xl px-6 lg:px-8">
									<div className="grid grid-cols-3 divide-x divide-gray-900/5 border-x border-gray-900/5">
										{callsToAction.map((item) => (
											<a
												key={item.name}
												href={item.href}
												className="flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-100">
												<item.icon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
												{item.name}
											</a>
										))}
									</div>
								</div>
							</div>
						</PopoverPanel>
					</Popover>

					<Link href="/about" className="text-sm font-semibold leading-6 text-gray-900">
						About
					</Link>
					<Link href="/blog" className="text-sm font-semibold leading-6 text-gray-900">
						Blog
					</Link>
					<Link href="/announcements" className="text-sm font-semibold leading-6 text-gray-900">
						Announcements
					</Link>
					<Link href="/contact" className="text-sm font-semibold leading-6 text-gray-900">
						Contact
					</Link>
				</PopoverGroup>
				<div className="hidden gap-4 lg:flex lg:flex-1 lg:justify-end">
					{status !== "authenticated" && (
						<Link href="/login" className="my-auto ml-auto text-sm font-semibold leading-6 text-gray-900">
							Log in <span aria-hidden="true">&rarr;</span>
						</Link>
					)}
					<Link
						href={status === "authenticated" ? "/medibook" : "/signup"}
						className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
						{status === "authenticated" ? (authSession.user.isDisabled ? "Account Disabled" : "Go to MediBook") : "Sign up"}
					</Link>
				</div>
			</nav>
			<Dialog className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
				<div className="fixed inset-0 z-10" />
				<DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
					<div className="flex items-center justify-between">
						<Link href={status === "authenticated" ? "/home" : "/"} className="-m-1.5 p-1.5">
							<span className="sr-only">MEDIMUN</span>
							<Image className="h-12 w-auto" src={WhiteLogo} alt="" />
						</Link>
						<button type="button" className="-m-2.5 rounded-md p-2.5 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
							<span className="sr-only">Close menu</span>
							<XMarkIcon className="h-6 w-6" aria-hidden="true" />
						</button>
					</div>
					<div className="mt-6 flow-root">
						<div className="-my-6 divide-y divide-gray-500/10">
							<div className="space-y-2 py-6">
								<Disclosure as="div" className="-mx-3">
									{({ open }) => (
										<>
											<DisclosureButton className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
												Product
												<ChevronDownIcon className={classNames(open ? "rotate-180" : "", "h-5 w-5 flex-none")} aria-hidden="true" />
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
								<a href="#" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
									Features
								</a>
								<a href="#" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
									Marketplace
								</a>
								<a href="#" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
									Company
								</a>
							</div>
							<div className="py-6">
								<a href="#" className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
									Log in
								</a>
							</div>
						</div>
					</div>
				</DialogPanel>
			</Dialog>
		</header>
	);
}
