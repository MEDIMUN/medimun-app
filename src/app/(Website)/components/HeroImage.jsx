"use client";

import { useEffect, useState } from "react";
import style from "./styles/HeroImage.module.css";
import delegatesColored from "@public/assets/delegates-colored.png";
import Image from "next/image";
import { position } from "@chakra-ui/react";

export default function HeroImage() {
	const [translateY, setTranslateY] = useState(0);
	const [grayFilter, setGrayFilter] = useState(1);
	const [displayed, setDisplayed] = useState(0);
	const [displayed2, setDisplayed2] = useState(0);

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
		setDisplayed(section);
		setDisplayed2(position - height);

		const moveStartingSection = 0.3;
		const grayStartingSection = 0.1;
		section > moveStartingSection ? setTranslateY((section - moveStartingSection) * 100 * 15) : setTranslateY(0);
		section > grayStartingSection ? setGrayFilter(1 - section * 2) : setGrayFilter(1);
	}

	return (
		<>
			<div className="br-4 w-50 fixed bottom-0 right-0 z-[70] mb-4 h-10 bg-white">
				{displayed}
				<br />
				{displayed2}
			</div>
			<Image
				style={{
					transform: `translateY(${translateY}px)`,
					filter: `grayscale(${grayFilter})`,
				}}
				alt="Image of 20 delegates lifting their placards containing the name of the country they represent."
				quality={90}
				className={style.delegatesColored}
				src={delegatesColored}
			/>
		</>
	);
}
