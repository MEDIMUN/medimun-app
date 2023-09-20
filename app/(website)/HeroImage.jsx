"use client";
import Image from "next/image";
import heroImage from "@/public/pages/index/hero.png";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function HeroImage() {
	const numbah = 300;
	const thickness = 0;
	const [scrollY, setScrollY] = useState(0);
	const clr = "#000";

	useEffect(() => {
		const handleScroll = () => {
			setScrollY(window.scrollY);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);
	return (
		<div
			style={{
				transform: "translateY(" + scrollY * 2 + "px)",
			}}>
			<Image className={"bottom-0 h-[40vh] select-none object-cover object-top shadow-xl grayscale md:h-[50vh] md:object-left-top" + " " + ""} src={heroImage} />
			<Link href={"#about"}>
				<div className="absolute bottom-6 left-[calc(50%-64px)] z-[500] mx-auto flex h-[34px] w-[128px] cursor-pointer justify-center rounded-xl bg-[#1a1a1a] p-1 px-4 text-center font-[canela] text-lg text-white outline-2 outline-white duration-500 hover:bg-gradient-to-r hover:from-gray-700 hover:via-gray-900 hover:to-black">
					See More
				</div>
			</Link>
		</div>
	);
}
