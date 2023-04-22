"use client";

import style from "./Section1.module.css";

import { useEffect, useState } from "react";

export default function Section1({ children }) {
	const [height, setHeight] = useState(10);
	const [color, setColor] = useState("#000");

	function handleScroll() {
		const position = window.pageYOffset;
		const windowHeight = window.innerHeight;
		const section = position / windowHeight;

		const heightPx = 10 - position / 20;
		const heightPx2 = (section - 0.5) * 65 + 1;

		section > 0.5 ? setColor("var(--medired)") : setColor("#000");

		section < 0.5 ? setHeight(heightPx) : setHeight(heightPx2);

		if (position > 100) {
		}
	}

	useEffect(() => {
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);
	return (
		<section
			className={style.section1}
			style={{
				background: `repeating-linear-gradient(45deg, ${color}, ${color} ${height}px, #181818 ${height}px, #181818 20px)`,
			}}>
			{children}
		</section>
	);
}
