"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import DelegatesVector from "@/public/assets/delegates-vector.webp";

export default function HeroImage() {
	const [scrollY, setScrollY] = useState(0);
	const divisor = 200;
	const opacity = 1 - scrollY / divisor;

	useEffect(() => {
		let ticking = false;

		function handleScroll() {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					const newScrollY = window.scrollY < 0 ? 0 : window.scrollY;
					setScrollY(newScrollY);
					ticking = false;
				});
				ticking = true;
			}
		}

		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	return (
		<div
			style={{
				transform: "translateY(" + scrollY + "px)",
				opacity: opacity,
			}}
			className="fixed bottom-0 z-[5] flex w-full justify-center">
			<div className=" mt-auto flex">
				<Image
					priority
					src={DelegatesVector}
					alt=""
					width={2000}
					height={2000}
					quality={90}
					className="!relative h-[60svh] w-full object-cover object-right opacity-85 drop-shadow-xl grayscale md:h-[85vh] md:object-center"
				/>
			</div>
		</div>
	);
}
