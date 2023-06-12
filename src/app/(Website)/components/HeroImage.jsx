"use client";

import { useEffect, useState } from "react";
import delegatesColored from "@public/assets/delegates-colored.png";
import paper from "@public/assets/paper.png";
import Image from "next/image";

export function Hero() {
	const [translateY, setTranslateY] = useState(0);
	const [grayFilter, setGrayFilter] = useState(1);

	useEffect(() => {
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	function handleScroll() {
		const position = window.pageYOffset;
		const height = window.innerHeight;
		const section = position / height;

		const moveStartingSection = 0.2;
		const grayStartingSection = 0.1;
		section > moveStartingSection ? setTranslateY((section - moveStartingSection) * 100 * 6) : setTranslateY(0);
		section > grayStartingSection ? setGrayFilter(1 - section * 2) : setGrayFilter(1);
	}

	return (
		<Image
			style={{
				transform: `translateY(${translateY}px)`,
				filter: `grayscale(${grayFilter})`,
			}}
			alt="Image of 20 delegates lifting their placards containing the name of the country they represent."
			quality={90}
			className="fixed bottom-0 z-[40] h-[60svh] select-none object-cover object-left-top md:h-[50svh]"
			src={delegatesColored}
		/>
	);
}

export function Paper() {
	const [translateY, setTranslateY] = useState(0);
	const [grayFilter, setGrayFilter] = useState(1);

	useEffect(() => {
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	function handleScroll() {
		const position = window.pageYOffset;
		const height = window.innerHeight;
		const section = position / height;

		const moveStartingSection = 0.2;
		const grayStartingSection = 0.1;
		section > moveStartingSection ? setTranslateY((section - moveStartingSection) * 100 * 6) : setTranslateY(0);
		section > grayStartingSection ? setGrayFilter(1 - section * 2) : setGrayFilter(1);
	}

	return (
		<Image
			style={{
				transform: `translateY(${translateY * 1.3}px)`,
				filter: `grayscale(${grayFilter})`,
			}}
			alt="Image of 20 delegates lifting their placards containing the name of the country they represent."
			quality={90}
			className="fixed bottom-[60%] left-0 z-[41] w-[100px] select-none"
			src={paper}
		/>
	);
}
