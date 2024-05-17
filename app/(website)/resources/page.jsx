import Background from "@/components/website/Background";
import { Button } from "@nextui-org/button";
import Link from "next/link";

export default async function Page() {
	const elId = Math.random().toString(36);
	const researchBooklets = [
		{ name: "General Assembly 1", href: "https://drive.google.com/file/d/1uye5uwpkvhsBtJV7bIN4zDnKDjgLHUG2/view?usp=sharing" },
		{ name: "General Assembly 2", href: "https://drive.google.com/file/d/1Z5OvpZd3elmJ_c6v1tk8WCuO9RjWPN_Z/view?usp=sharing" },
		{ name: "General Assembly 3", href: "https://drive.google.com/file/d/16_SYkqQeRVIBbWUnYnWvCW3kPN7gBeEb/view?usp=sharing" },
		{ name: "General Assembly 4", href: "https://drive.google.com/file/d/1UOVvLd80sLPkHkvAF1ShUgWz2UqfOe47/view?usp=sharing" },
		{ name: "Security Council", href: "https://drive.google.com/file/d/1FBAv5s9VfFcTzERZiumOax8gldxLkCT_/view?usp=sharing" },
		{ name: "Historical Security Council", href: "https://drive.google.com/file/d/1x9GADBXTiMFeBCAukIzo-700SMsBznDS/view?usp=sharing" },
		{ name: "Commission on the Status of Women", href: "https://drive.google.com/file/d/1YNRKOvia9_r0LzLdIRH5LDAdxkDGzrQe/view?usp=sharing" },
	];
	const resources = [];
	return (
		<>
			<div id={elId} className="mx-auto max-w-[1248px] p-5 pt-24 font-[montserrat] text-black">
				<h1 className="select-none rounded-3xl font-[Montserrat] text-[35px] font-[700] text-black">Resources</h1>
				<h2 className="mt-2 text-lg">Research Booklets</h2>
				<ul className="flex flex-col gap-2">
					{researchBooklets.map((link) => {
						const newLink = link.href.replace("https://drive.google.com/file/d/", "https://drive.google.com/uc?export=view&id=").replace("/view?usp=sharing", "");
						return (
							<li key={link.name} className="flex w-full rounded-sm bg-white p-5 text-black">
								<h2 className="md:text-md my-auto text-sm lg:text-xl">{link.name}</h2>
								<Button className="ml-auto" as={Link} href={newLink} target="_blank">
									Download
								</Button>
							</li>
						);
					})}
				</ul>
				{!!resources.length && <h2 className="mt-4 text-lg">Teacher Resources</h2>}
				<ul className="flex flex-col gap-2">
					{resources.map((link) => {
						const newLink = link.href.replace("https://drive.google.com/file/d/", "https://drive.google.com/uc?export=view&id=").replace("/view?usp=sharing", "");
						return (
							<li key={link.name} className="flex w-full rounded-sm bg-white p-5 text-black">
								<h2 className="md:text-md my-auto text-sm lg:text-xl">{link.name}</h2>
								<Link className="ml-auto" target="_blank" href={newLink}>
									<Button>Download</Button>
								</Link>
							</li>
						);
					})}
				</ul>
			</div>
		</>
	);
}
