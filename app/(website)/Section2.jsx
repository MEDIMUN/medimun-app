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

	const boxStyle = "rounded-xl border-[1px] border-[#eaeaea] bg-white duration-300 shadow-sm hover:shadow-xl p-4";
	return (
		<section
			style={{
				transform: "translateY(" + -scrollY + "px)",
			}}
			id="about"
			className="h-[150vh] bg-[#fdfdfd] p-3 font-[montserrat]">
			<div className="min-h-auto mx-auto mt-[25vh] grid h-[150vh] max-w-[1248px] gap-4 p-4 md:h-screen md:grid-cols-2 lg:grid-cols-3">
				<div className={boxStyle + " " + "row-span-2"}>
					<h1 className="pb-3 text-2xl">Welcome to MEDIMUN</h1>
					MEDIMUN, also known as the Mediterranean Model United Nations, is a simulated United Nations experience specifically designed for teenagers between the ages of 15 and 19.
					During this event, students take on the roles of delegates representing various UN Member States that are assigned to them. They engage in in-depth research on their
					assigned country's policies and use this knowledge to discuss, create, and debate resolutions. These resolutions are detailed documents that outline their suggestions and
					solutions to global issues, forming the foundation for multifaceted debates and constructive discussions on diverse topics.
				</div>
				<div className={boxStyle + " " + ""}></div>
				<div className={boxStyle + " " + ""}></div>
				<div className={boxStyle + " " + "row-span-2"}></div>
				<div className={boxStyle + " " + ""}></div>
				<div className={boxStyle + " " + ""}></div>
				<div className={boxStyle + " " + "row-span-3"}></div>
				<div className={boxStyle + " " + ""}></div>
				<div className={boxStyle + " " + ""}></div>
				<div className={boxStyle + " " + ""}></div>
			</div>
		</section>
	);
}
