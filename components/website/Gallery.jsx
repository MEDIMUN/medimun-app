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
import Link from "next/link";

export default function HeroImage() {
	const [displayed, setDisplayed] = useState(false);
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
		if (section > 1.55) {
			setDisplayed(true);
		} else {
			setDisplayed(false);
		}

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

	const imageStyles =
		"globallogo m-auto max-h-[80%] w-auto max-w-[90%] rounded-xl hover:rounded-3xl duration-500 object-contain shadow-none hover:shadow-2xl hover:shadow-[var(--medired)]";
	const imageWrapperStyle = "left-0 flex min-w-[100vw] p-5 md:p-20";

	const images = [
		{ src: img1, alt: "Delegates in the middle of a debate" },
		{ src: img2, alt: "Expert speaker giving a speech to a committee" },
		{ src: img3, alt: "Delegates in the middle of a debate" },
		{ src: img4, alt: "Delegates and chairs playing an ice-breaker challenge within their committee" },
		{ src: img5, alt: "Delegates lifting their plackards during a debate" },
		{ src: img6, alt: "Delegates listening to their chair" },
	];

	if (displayed) {
		return (
			<div className="fixed z-[5] flex h-[100dvh] w-[100%] justify-center bg-[#181818] align-middle">
				{scroll < 700 && (
					<div className="absolute bottom-0 flex max-h-[20px] w-full">
						<Progress className="relative z-[9] mx-auto max-h-[20px] rounded-none bg-white" value={(scroll / 700) * 100} />
					</div>
				)}
				<ul style={{ transform: `translateX(-${parseInt(scroll)}%)` }} className={`flex max-w-[100%] flex-row duration-500`}>
					{images.map((image) => (
						<li key={Math.random()} className={imageWrapperStyle}>
							<Image placeholder="blur" la alt={image.alt} className={imageStyles} src={image.src} />
						</li>
					))}
					<li className="left-0 flex min-w-[100vw] p-5">
						<div className="rounded-10 m-auto max-h-[80%] w-[80%] overflow-hidden rounded-2xl text-center font-['canela'] text-[50px] text-white md:text-[100px]">
							<Link href="/signup">
								<div className="flex cursor-pointer flex-col rounded-none duration-200 after:content-['Ready_to_join?'] hover:after:rounded-[50px] hover:after:bg-white hover:after:text-black hover:after:content-['Sign_Up_↗'] md:hover:after:rounded-[300px]"></div>
							</Link>
						</div>
					</li>
					<li className={imageWrapperStyle}>
						<Image alt="Delegates standing together to take the final day photo outside" className={imageStyles} src={delegatesOutside} />
					</li>
				</ul>
			</div>
		);
	}
}
