"use client";

import style from "./Section1.module.css";

import { useEffect, useState } from "react";

export default function Section1({ children }) {
	const [height, setHeight] = useState(10);

	function handleScroll() {
		const offset = window.scrollY;
		const height = 10 - offset / 20;
		console.log(height);
		if (height < 0) {
			setHeight(height);
		} else {
			setHeight(height);
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
				background: `repeating-linear-gradient(45deg, #000000, #000000 ${height}px, #181818 ${height}px, #181818 20px)`,
			}}>
			{children}
		</section>
	);
}
