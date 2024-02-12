"use client";

import React, { useEffect, createContext, useState } from "react";

export const DarkModeContext = createContext();

const DarkModeProvider = ({ children }) => {
	const [isDark, setIsDark] = useState(false);
	//get users system darkmode
	useEffect(() => {
		if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			setIsDark(true);
		} else {
			setIsDark(false);
		}
	}, []);
	return (
		<DarkModeContext.Provider value={{ isDark, setIsDark }}>
			<html lang="en" className={`font-[montserrat] ${isDark && "dark"}`}>
				{children}
			</html>
		</DarkModeContext.Provider>
	);
};

export default DarkModeProvider;
