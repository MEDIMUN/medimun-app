"use client";

import Image from "next/image";
import heroImage from "@/public/pages/index/hero2.png";
import { useEffect, useState } from "react";

export default function HeroImage() {
	const [scrollY, setScrollY] = useState(0);

	const divisor = 200;

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY < 0) {
				setScrollY(0);
				return;
			}
			setScrollY(window.scrollY);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	return (
		<>
			<div
				style={{
					transform: "translateY(" + scrollY + "px)",
					opacity: 1 - scrollY / divisor,
				}}
				className="fixed bottom-0 z-10 hidden max-h-[90vh] min-h-[60vh] md:block">
				<Image className=" min-h-[65vh] object-cover object-right opacity-90 grayscale" alt="Delagtes having fun" src={heroImage} />
			</div>
			<div
				style={{
					opacity: 1 - scrollY / divisor,
				}}
				className={`fixed bottom-0 z-10 max-h-[90vh] min-h-[60vh] md:hidden ${scrollY / divisor < 1 ? "block" : "hidden"}`}>
				<Image className=" min-h-[65vh] object-cover object-right opacity-90 grayscale" alt="Delagtes having fun" src={heroImage} />
			</div>
		</>
	);
}
