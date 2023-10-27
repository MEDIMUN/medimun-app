"use client";
import Image from "next/image";
import heroImage from "@/public/pages/index/hero2.png";
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
				transform: "translateY(" + scrollY + "px)",
			}}
			className="fixed bottom-0 max-h-[90vh] min-h-[60vh]">
			<Image className=" min-h-[65vh] object-cover object-right opacity-90 grayscale" src={heroImage} />
		</div>
	);
}
