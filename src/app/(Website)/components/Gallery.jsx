"use client";

import { useEffect, useState } from "react";
import delegatesColored from "@public/assets/delegates-indoors.jpg";
import Image from "next/image";

export default function HeroImage() {
	const [displayed, setDisplayed] = useState(0);
	const [scroll, setScroll] = useState(0);

	useEffect(() => {
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	let h;
	useEffect(() => {
		const element = document.getElementById("totalH");
		h = element.clientHeight;
	}, []);

	let amount;

	function handleScroll() {
		const position = window.pageYOffset;
		const height = window.innerHeight;
		const section = position / height;
		const current = position - (h + height);
		section > 1.55 ? setDisplayed(true) : setDisplayed(false);

		const difference = 400;
		const start = 0;

		if (current > 5 * difference + start) {
			setScroll("500%");
			return;
		}
		if (current > 4 * difference + start) {
			setScroll("400%");
			return;
		}
		if (current > 3 * difference + start) {
			setScroll("300%");
			return;
		}
		if (current > 2 * difference + start) {
			setScroll("200%");
			return;
		}
		if (current > start + difference - 200) {
			setScroll("100%");
			return;
		}
		if (current > start) {
			setScroll("0%");
			return;
		}

		setScroll(amount + "%");
	}

	if (displayed) {
		return (
			<div className="fixed z-[5] flex h-[100svh] w-[100%] justify-center bg-[#181818] align-middle">
				<ul style={{ transform: `translateX(-${scroll})` }} className={`flex max-w-[100%] flex-row duration-500 -translate-x-[${scroll}%]`}>
					<li className="left-0 flex min-w-[100vw] p-20">
						<div className="rounded-10 m-auto max-h-[80%] w-[80%] overflow-hidden rounded-2xl">
							<Image alt="" fill className="globallogo shadow-2xl" src={delegatesColored} />
						</div>
					</li>
					<li className="left-0 flex min-w-[100vw] p-20">
						<div className="rounded-10 m-auto max-h-[80%] w-[80%] overflow-hidden rounded-2xl">
							<Image alt="" fill className="globallogo shadow-2xl" src={delegatesColored} />
						</div>
					</li>
					<li className="left-0 flex min-w-[100vw] p-20">
						<div className="rounded-10 m-auto max-h-[80%] w-[80%] overflow-hidden rounded-2xl">
							<Image alt="" fill className="globallogo shadow-2xl" src={delegatesColored} />
						</div>
					</li>
					<li className="left-0 flex min-w-[100vw] p-20">
						<div className="rounded-10 m-auto max-h-[80%] w-[80%] overflow-hidden rounded-2xl">
							<Image alt="" fill className="globallogo shadow-2xl" src={delegatesColored} />
						</div>
					</li>
					<li className="left-0 flex min-w-[100vw] p-20">
						<div className="rounded-10 m-auto max-h-[80%] w-[80%] overflow-hidden rounded-2xl">
							<Image alt="" fill className="globallogo shadow-2xl" src={delegatesColored} />
						</div>
					</li>
					<li className="left-0 flex min-w-[100vw] p-20">
						<div className="rounded-10 m-auto max-h-[80%] w-[80%] overflow-hidden rounded-2xl">
							<Image alt="" fill className="globallogo shadow-2xl" src={delegatesColored} />
						</div>
					</li>
				</ul>
			</div>
		);
	}
}
