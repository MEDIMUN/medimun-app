import Paginator from "@/components/pagination";
import { Suspense } from "react";

export default async function Page() {
	return (
		<div className="py-24 sm:py-32">
			<div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
				<div className="mb-4 lg:px-8">
					<div className="mx-auto max-w-2xl text-left md:text-center">
						<h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Sessions</h2>
						<p className="mt-2 text-lg leading-6 text-gray-600 md:mt-3">
							All Past, Current and Future Sessions of our Conference.
							<br />
							This section will be made available on the 26th of September, 2024
						</p>
					</div>
				</div>
				<Suspense fallback={<div>Loading...</div>}>
					<Paginator totalItems={0} itemsOnPage={0} />
				</Suspense>
			</div>
		</div>
	);
}

const researchBooklets = [
	{ name: "General Assembly 1", href: "https://drive.google.com/file/d/1uye5uwpkvhsBtJV7bIN4zDnKDjgLHUG2/view?usp=sharing" },
	{ name: "General Assembly 2", href: "https://drive.google.com/file/d/1Z5OvpZd3elmJ_c6v1tk8WCuO9RjWPN_Z/view?usp=sharing" },
	{ name: "General Assembly 3", href: "https://drive.google.com/file/d/16_SYkqQeRVIBbWUnYnWvCW3kPN7gBeEb/view?usp=sharing" },
	{ name: "General Assembly 4", href: "https://drive.google.com/file/d/1UOVvLd80sLPkHkvAF1ShUgWz2UqfOe47/view?usp=sharing" },
	{ name: "Security Council", href: "https://drive.google.com/file/d/1FBAv5s9VfFcTzERZiumOax8gldxLkCT_/view?usp=sharing" },
	{ name: "Historical Security Council", href: "https://drive.google.com/file/d/1x9GADBXTiMFeBCAukIzo-700SMsBznDS/view?usp=sharing" },
	{ name: "Commission on the Status of Women", href: "https://drive.google.com/file/d/1YNRKOvia9_r0LzLdIRH5LDAdxkDGzrQe/view?usp=sharing" },
];
