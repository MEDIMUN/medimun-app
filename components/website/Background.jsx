"use client";

import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useEffect, useState, useRef } from "react";

export const revalidate = 60;

export default function Background(props) {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [elementHeight, setElementHeight] = useState("100vh");

	const vignette = `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, #AE2D2890 0%, rgb(0, 0, 0) 70%, rgb(0, 0, 0) 100%)`;
	const { width, height } = useWindowDimensions();

	const updateMousePosition = (ev) => {
		setMousePosition({ x: ev.clientX, y: ev.clientY });
	};

	useEffect(() => {
		window.addEventListener("mousemove", updateMousePosition);
		return () => window.removeEventListener("mousemove", updateMousePosition);
	}, []);

	useEffect(() => {
		if (!props.id) return;
		setElementHeight(document.getElementById(props.id).offsetHeight);
	}, [width, height]);

	return (
		<>
			<div style={{ height: elementHeight, background: vignette }} className="absolute -z-[1] min-h-screen w-full" />
			<div style={{ height: elementHeight }} className="absolute -z-[2] min-h-screen w-full bg-[url(/assets/delegates-indoors-2.jpg)] bg-cover" />
		</>
	);
}
