"use client";

import { useEffect, useState } from "react";
import useWindowDimensions from "./use-window-dimensions";

interface ScreenSizeClass {
	sm: string;
	md: string;
	lg: string;
	xl: string;
}

export function useScreenSizeClass() {
	const [screenSizeClass, setScreenSizeClass] = useState("xl");
	const { width } = useWindowDimensions();

	useEffect(() => {
		if (window.innerWidth < 640) {
			setScreenSizeClass("sm");
		} else if (window.innerWidth < 768) {
			setScreenSizeClass("md");
		} else if (window.innerWidth < 1024) {
			setScreenSizeClass("lg");
		} else {
			setScreenSizeClass("xl");
		}
	}, [width]);
	return screenSizeClass as keyof ScreenSizeClass;
}
