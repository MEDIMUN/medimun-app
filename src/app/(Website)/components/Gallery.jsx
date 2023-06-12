"use client";

import { useEffect, useState } from "react";
import delegatesColored from "@public/assets/delegates-indoors.jpg";
import delegatesOutside from "@public/placeholders/cover-image.jpg";
import img1 from "@public/pages/index/section3images/1.jpeg";
import img2 from "@public/pages/index/section3images/2.jpeg";
import img3 from "@public/pages/index/section3images/3.jpeg";
import img4 from "@public/pages/index/section3images/4.jpeg";
import img5 from "@public/pages/index/section3images/5.jpeg";
import img6 from "@public/pages/index/section3images/6.jpeg";
import { Progress } from "@/components/ui/progress";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroImage() {
	const [displayed, setDisplayed] = useState(0);
	const [scroll, setScroll] = useState(0);
	let h;

	useEffect(() => {
		window.addEventListener("scroll", handleScroll, { passive: true });
		window.addEventListener("resize", setElemHeight, { passive: true });
		setElemHeight();

		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", setElemHeight);
		};
	}, []);

	function setElemHeight() {
		h = document.getElementById("totalH").clientHeight;
	}

	function handleScroll() {
		const position = window.pageYOffset;
		const height = window.innerHeight;
		const section = position / height;
		const current = position - (h + height);
		section > 1.55 ? setDisplayed(true) : setDisplayed(false);

		const difference = height / 3;

		if (current > height * 3) {
			setScroll(700);
			return;
		}
		if (current > difference * 5 - 120) {
			setScroll(600);
			return;
		}
		if (current > difference * 4) {
			setScroll(500);
			return;
		}
		if (current > difference * 3) {
			setScroll(400);
			return;
		}
		if (current > difference * 2) {
			setScroll(300);
			return;
		}
		if (current > difference * 1) {
			setScroll(200);
			return;
		}
		if (current > 0) {
			setScroll(100);
			return;
		}
		if (current < 0) {
			setScroll(0);
			return;
		}
	}

	if (displayed) {
		return (
			<div className="fixed z-[5] flex h-[100dvh] w-[100%] justify-center bg-[#181818] align-middle">
				{scroll < 700 && (
					<div className="absolute bottom-0 flex max-h-[20px] w-full">
						<Progress className="relative z-[9] mx-auto max-h-[20px] rounded-none bg-white" value={(scroll / 700) * 100} />
					</div>
				)}
				<ul style={{ transform: `translateX(-${parseInt(scroll)}%)` }} className={`flex max-w-[100%] flex-row duration-500`}>
					<li className="left-0 flex min-w-[100vw] p-5 md:p-20">
						<div className="rounded-10 m-auto max-h-[80%] w-[90%] overflow-hidden rounded-2xl md:w-[80%]">
							<Image alt="" fill className="globallogo shadow-2xl" src={img1} />
						</div>
					</li>
					<li className="left-0 flex min-w-[100vw] p-5 md:p-20">
						<div className="rounded-10 m-auto max-h-[80%] w-[90%] overflow-hidden rounded-2xl md:w-[80%]">
							<Image alt="" fill className="globallogo shadow-2xl" src={img2} />
						</div>
					</li>
					<li className="left-0 flex min-w-[100vw] p-5 md:p-20">
						<div className="rounded-10 m-auto max-h-[80%] w-[90%] overflow-hidden rounded-2xl md:w-[80%]">
							<Image alt="" fill className="globallogo shadow-2xl" src={img3} />
						</div>
					</li>
					<li className="left-0 flex min-w-[100vw] p-5 md:p-20">
						<div className="rounded-10 m-auto max-h-[80%] w-[90%] overflow-hidden rounded-2xl md:w-[80%]">
							<Image alt="" fill className="globallogo shadow-2xl" src={img4} />
						</div>
					</li>
					<li className="left-0 flex min-w-[100vw] p-5 md:p-20">
						<div className="rounded-10 m-auto max-h-[80%] w-[90%] overflow-hidden rounded-2xl md:w-[80%]">
							<Image alt="" fill className="globallogo shadow-2xl" src={img5} />
						</div>
					</li>
					<li className="left-0 flex min-w-[100vw] p-5 md:p-20">
						<div className="rounded-10 m-auto max-h-[80%] w-[90%] overflow-hidden rounded-2xl md:w-[80%]">
							<Image alt="" fill className="globallogo shadow-2xl" src={img6} />
						</div>
					</li>
					<li className="left-0 flex min-w-[100vw] p-5">
						<div className="rounded-10 m-auto max-h-[80%] w-[80%] overflow-hidden rounded-2xl text-center font-['canela'] text-[50px] text-white md:text-[100px]">
							<Link href="/signup">
								<div className="flex cursor-pointer flex-col rounded-none duration-200 after:content-['Ready_to_join?'] hover:after:rounded-[50px] hover:after:bg-white hover:after:text-black hover:after:content-['Sign_Up_↗'] md:hover:after:rounded-[300px]"></div>
							</Link>
						</div>
					</li>
					<li className="left-0 flex min-w-[100vw] p-10">
						<div className="rounded-10 m-auto max-h-[80%] w-[100%] overflow-hidden rounded-2xl">
							<Image alt="" fill className="globallogo w-[100%] shadow-2xl" src={delegatesOutside} />
						</div>
					</li>
				</ul>
			</div>
		);
	}
}
