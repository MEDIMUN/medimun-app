"use client";

import { useEffect, useState } from "react";
import style from "./HeroImage.module.css";
import delegatesColored from "@public/assets/delegates-colored.png";
import Image from "next/image";

export default function HeroImage() {
	const [translateY, setTranslateY] = useState(125);
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

		section > 0.5 ? setTranslateY((section * 300 - 90) * 2.25) : setTranslateY(125);
	}

	return <Image style={{ transform: `translateY(${translateY}px)` }} alt="Image of 20 delegates lifting their placards containing the name of the country they represent." quality={100} className={style.delegatesColored} src={delegatesColored} />;
}
