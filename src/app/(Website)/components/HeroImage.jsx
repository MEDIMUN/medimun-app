"use client";

import { useEffect, useState } from "react";
import style from "./styles/HeroImage.module.css";
import delegatesColored from "@public/assets/delegates-colored.png";
import Image from "next/image";

export default function HeroImage() {
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
		const moveStartingSection = 0.6;
		const grayStartingSection = 0.1;

		section > moveStartingSection ? setTranslateY((section - moveStartingSection) * 100 * 4.25) : setTranslateY(0);
		section > grayStartingSection ? setGrayFilter(1 - section * 2) : setGrayFilter(1);
	}

	return <Image style={{ transform: `translateY(${translateY}px)`, filter: `grayscale(${grayFilter})` }} alt="Image of 20 delegates lifting their placards containing the name of the country they represent." quality={90} className={style.delegatesColored} src={delegatesColored} />;
}
