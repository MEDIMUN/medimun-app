"use client";

import heroImage from "@/public/pages/index/hero.png";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";

export function Section2() {
	const [scrollY, setScrollY] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			setScrollY(window.scrollY);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	const boxStyle = "rounded-xl border-[1px] border-[#eaeaea] bg-white duration-300 shadow-sm hover:shadow-xl p-4";
	return (
		<section id="about" className="h-auto gap-5 bg-gradient-to-r from-rose-100 to-teal-100 font-[montserrat] text-black">
			<div className="mx-auto h-auto max-w-[1260px] p-5">
				<div className="">
					<h1 className="pb-3 text-xl font-[600] text-gray-600 ">WELCOME TO MEDIMUN</h1>
					<p className="md:text-md text-sm">
						MEDIMUN is a simulated United Nations experience specifically designed for teenagers between the ages of 15 and 19. During this event, students take on the roles of
						delegates representing various UN Member States that are assigned to them. They engage in in-depth research on their assigned country's policies and use this knowledge
						to discuss, create, and debate resolutions. These resolutions are detailed documents that outline their suggestions and solutions to global issues, forming the
						foundation for multifaceted debates and constructive discussions on diverse topics.
					</p>
				</div>
			</div>
			<div className="mx-auto grid h-auto max-w-[1260px] grid-cols-1 gap-5 p-5 md:h-[220px] md:grid-cols-2">
				<div className="text-900 h-full overflow-hidden rounded-xl border-2 border-slate-200 bg-[url(/assets/delegates-indoors.jpg)] bg-cover bg-center duration-300 hover:shadow-xl">
					<div className="flex h-full w-full flex-col bg-white bg-opacity-70 p-5">
						<div>
							19<sup>th</sup> Annual Session <br />
							<span className="text-sm">
								Discover the 19th Annual Session of MEDIMUN, the largest MEDIMUN ever, set to take place from 2nd to 4th of February at The European University Cyprus.
							</span>
						</div>
						<Link className="mt ml-auto mt-5 w-full md:mt-auto md:w-max" href="/sessions/19">
							<Button className="w-full md:w-max">Explore</Button>
						</Link>
					</div>
				</div>
				<div className="text-900 h-full overflow-hidden rounded-xl border-2 border-slate-200 bg-white bg-cover bg-center duration-300 hover:shadow-xl">
					<div className="flex h-full w-full flex-col bg-white bg-opacity-40 p-5">
						<div>
							Check Out The Prospectus <br />
							<span className="text-sm">
								The prospectus contains all the information you need to know about the 19<sup>th</sup> Annual Session, including the committees, the topics, and the rules of
								procedure.
							</span>
						</div>
						<Link className="ml-auto mt-5 w-full md:mt-auto md:w-max" target="_blank" href="https://drive.google.com/file/d/1BBBbX8RepI6toL4M2WUS3KE2IkuM2g2d/view?usp=drive_link">
							<Button className="w-full md:w-max">View</Button>
						</Link>
					</div>
				</div>
			</div>
			<div className="rounded-[50%_50%_0_0] ">
				<Image className="mx-auto h-[400px] max-h-[500px] object-cover object-top opacity-90 grayscale md:h-[500px]" src={heroImage} alt="Delegates in the middle of a debate" />
			</div>
		</section>
	);
}

{
	/* <div className="min-h-auto mx-auto mt-[25vh] grid h-[150vh] max-w-[1248px] gap-4 p-4 md:h-screen md:grid-cols-2 lg:grid-cols-3">
<div className={boxStyle + " " + "row-span-2"}></div>
<div className={boxStyle + " " + ""}></div>
<div className={boxStyle + " " + ""}></div>
<div className={boxStyle + " " + "row-span-2"}></div>
<div className={boxStyle + " " + ""}></div>
<div className={boxStyle + " " + ""}></div>
<div className={boxStyle + " " + "row-span-3"}></div>
<div className={boxStyle + " " + ""}></div>
<div className={boxStyle + " " + ""}></div>
<div className={boxStyle + " " + ""}></div>
</div> */
}
