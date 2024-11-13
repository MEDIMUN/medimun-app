"use client";

import { Listbox, ListboxOption } from "@/components/listbox";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function PoliciesNavbar({ allPolicies }) {
	const pathname = usePathname();

	const router = useRouter();

	return (
		<div className="border-b border-gray-200 pb-5 font-[GilroyLight] sm:pb-0">
			<div className="mt-3 sm:mt-4">
				<div className="mr-4 sm:hidden">
					<label htmlFor="current-tab" className="sr-only">
						Select a tab
					</label>
					<select
						onChange={(e) => {
							router.push(e.target.value);
						}}
						name="current-tab"
						defaultValue={pathname}
						className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary focus:outline-none focus:ring-primary sm:text-sm">
						{allPolicies.map((tab) => (
							<option value={tab.slug} key={tab.name}>
								{tab.title}
							</option>
						))}
					</select>
				</div>
				<div className="hidden sm:block">
					<nav className="-mb-px flex justify-center space-x-8">
						{allPolicies.map((tab) => (
							<Link
								key={`${tab.name}-tab-${Math.random()}`}
								href={tab.slug}
								aria-current={pathname == `/policies/${tab.slug}` ? "page" : undefined}
								className={cn(
									pathname == `/policies/${tab.slug}`
										? "border-primary text-primary"
										: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
									"text-md whitespace-nowrap border-b-2 px-1 pb-4 font-medium"
								)}>
								{tab.title}
							</Link>
						))}
					</nav>
				</div>
			</div>
		</div>
	);
}
