"use client";

import { useEffect, useState } from "react";

export function Section2() {
	const [scrollY, setScrollY] = useState(0);

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
		<section
			style={{
				transform: "translateY(" + -scrollY + "px)",
			}}
			id="about"
			className="h-[150vh] bg-white to-white p-3">
			<div className="min-h-auto mx-auto  grid h-[150vh] max-w-[1248px] gap-4 p-4 md:h-screen md:grid-cols-2 lg:grid-cols-3">
				<div className="row-span-2 rounded-xl border-[1px] border-[#eaeaea] bg-white bg-opacity-40 duration-300 hover:shadow-md"></div>
				<div className="rounded-xl bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 duration-300 hover:shadow-md"></div>
				<div className="rounded-xl bg-gradient-to-r from-yellow-600 to-red-600 duration-300 hover:shadow-md"></div>
				<div className="to-gray-600duration-300 row-span-2 rounded-xl bg-opacity-40 bg-gradient-to-r from-gray-200 via-gray-400 hover:shadow-md"></div>
				<div className="rounded-xl border-[1px] border-[#eaeaea] bg-white bg-opacity-40 duration-300 hover:shadow-md"></div>
				<div className="rounded-xl border-[1px] border-[#eaeaea] bg-white bg-opacity-40 duration-300 hover:shadow-md"></div>
				<div className="rounded-xl border-[1px] border-[#eaeaea] bg-white bg-opacity-40 duration-300 hover:shadow-md"></div>
				<div className="rounded-xl border-[1px] border-[#eaeaea] bg-white bg-opacity-40 duration-300 hover:shadow-md"></div>
				<div className="rounded-xl border-[1px] border-[#eaeaea] bg-white bg-opacity-40 duration-300 hover:shadow-md"></div>
			</div>
		</section>
	);
}
