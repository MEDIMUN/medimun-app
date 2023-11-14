"use client";

import dab from "@/public/pages/index/dabbing.jpg";
import heroImage from "@/public/pages/index/hero.png";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";

export function Section2() {
	const [scrollY, setScrollY] = useState(0);
	const [screenHeight, setScreenHeight] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			setScrollY(window.scrollY);
		};

		setScreenHeight(window.screen.height);

		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	const boxStyle = "rounded-xl border-[1px] border-[#eaeaea] bg-white duration-300 shadow-sm hover:shadow-xl p-4";

	return (
		<>
			<section className="hidden h-screen w-full flex-row bg-gray-200 font-[LondiniaMedium] md:flex">
				<div className="top-screen absolute right-[calc(50%-.5px)] z-[0] h-[25vh] w-[1px] bg-gradient-to-b from-black to-transparent opacity-50" />
				<div className="absolute right-[calc(50%-.5px)] top-[175vh] z-[0] h-[25vh] w-[1px] bg-gradient-to-t from-black to-transparent" />
				<div className="mx-auto flex h-full w-[50vw] flex-col gap-5 p-5">
					<p
						style={{ transform: "translateY(" + -scrollY / 3 + "px)" }}
						className="mt-auto p-5 text-[25px] leading-[30px] md:text-[30px] md:leading-[30px] lg:text-[33px] lg:leading-[42px]">
						<span className="text-medired">MEDIMUN is a simulation of the United Nations for teens aged 15-19</span>, where students represent assigned UN countries. They research
						their nation's policies to draft and debate resolutions on global issues, fostering diverse and in-depth discussions.
						<br />
					</p>
					<div className="relative m-5 flex flex-col gap-5 bg-gray-300 p-5 text-[25px] text-sm md:w-[35vw]">
						Check out the 19th Annual Session of MEDIMUN, the largest MEDIMUN ever, set to take place from 2nd to 4th of February at The European University Cyprus.
						<div className="flex flex-col gap-2 xl:flex-row">
							<Button className="rounded-none bg-black">Discover the latest session</Button>
							<Button className="rounded-none bg-black">Download the prospectus</Button>
						</div>
					</div>
				</div>
				<div className="h-full w-[50vw] p-10">
					<Image
						alt="300 Delegates standing up for a photo at an amphitheatre and same dabbing."
						src={dab}
						className="shadow-2xl"
						style={{ transform: "translateY(" + scrollY / 4 + "px)" }}
					/>
				</div>
			</section>
			<section className="flex h-auto w-full flex-col bg-gray-200 pb-5 font-[LondiniaMedium] md:hidden md:flex-row">
				<div className="top-screen absolute right-[calc(50%-.5px)] z-[0] h-[25vh] w-[1px] bg-gradient-to-b from-black to-transparent opacity-50" />
				<div className="absolute right-[calc(50%-.5px)] top-[175vh] z-[0] h-[25vh] w-[1px] bg-gradient-to-t from-black to-transparent" />

				<div className="mx-auto flex h-full w-full flex-col gap-5 p-5 md:w-[50vw]">
					<p style={{ transform: "translateY(" + scrollY / 14 + "px)" }} className="mt-auto p-5 text-[25px] leading-[30px] md:text-[36px] md:leading-[42px]">
						MEDIMUN is a simulation of the United Nations for teens aged 15-19, where students represent assigned UN countries. They research their nation's policies to draft and
						debate resolutions on global issues, fostering diverse and in-depth discussions.
					</p>
				</div>
				<div className="h-full w-full p-10 md:w-[50vw]">
					<Image
						src={dab}
						className=""
						style={{ transform: "translateY(" + scrollY / 45 + "px)" }}
						alt="300 Delegates standing up for a photo at an amphitheatre and same dabbing."
					/>
				</div>
				<div style={{ transform: "translateY(" + scrollY / 50 + "px)" }} className="relative m-5 mt-0 flex flex-col gap-5 bg-gray-300 p-5 text-[25px] text-sm md:w-[35vw]">
					Check out the 19th Annual Session of MEDIMUN, the largest MEDIMUN ever, set to take place from 2nd to 4th of February at The European University Cyprus.
					<div className="flex flex-col gap-2">
						<Button className="rounded-none bg-black">Discover the latest session</Button>
						<Button className="rounded-none bg-black">Download the prospectus</Button>
					</div>
				</div>
			</section>
		</>
	);
}
