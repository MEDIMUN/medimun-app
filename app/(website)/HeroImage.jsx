"use client";

import Image from "next/image";
import heroImage from "@/public/pages/index/hero2.png";
import { useEffect, useState } from "react";

export default function HeroImage() {
	const numbah = 200;
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
		<>
			<div
				style={{
					transform: "translateY(" + scrollY + "px)",
					opacity: 1 - scrollY / numbah,
				}}
				className="fixed bottom-0 z-10 hidden max-h-[90vh] min-h-[60vh] md:block">
				<Image className=" min-h-[65vh] object-cover object-right opacity-90 grayscale" alt="Delagtes having fun" src={heroImage} />
			</div>
			<div
				style={{
					opacity: 1 - scrollY / numbah,
				}}
				className={`fixed bottom-0 z-10 max-h-[90vh] min-h-[60vh] md:hidden ${scrollY / numbah < 1 ? "block" : "hidden"}`}>
				<Image className=" min-h-[65vh] object-cover object-right opacity-90 grayscale" alt="Delagtes having fun" src={heroImage} />
			</div>
		</>
	);
}
