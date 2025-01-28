"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import Link from "next/link";
import { FastLink } from "@/components/fast-link";

export function ExpandableCards({ people }) {
	const [mounted, setMounted] = useState(false);
	const [active, setActive] = useState<(typeof people)[number] | boolean | null>();
	const id = useId();
	const ref = useRef<HTMLDivElement>(null);

	const MotionLink = motion.create(FastLink);

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setActive(false);
			}
		}

		if (active && typeof active === "object") {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [active]);

	function handleSetNull() {
		setActive(null);
	}

	useOutsideClick(ref, handleSetNull);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (mounted)
		return (
			<>
				<AnimatePresence>
					{active && typeof active === "object" && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black/20 h-full w-full z-[10]"
						/>
					)}
				</AnimatePresence>
				<AnimatePresence>
					{active && typeof active === "object" ? (
						<div className="fixed inset-0 grid place-items-center z-[1000000]">
							<motion.button
								key={`button-${active?.title}-${id}-${active?.index}`}
								layout
								initial={{
									opacity: 0,
								}}
								animate={{
									opacity: 1,
								}}
								exit={{
									opacity: 0,
									transition: {
										duration: 0.05,
									},
								}}
								className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
								onClick={() => setActive(null)}>
								<CloseIcon />
							</motion.button>
							<motion.div
								layoutId={`card-${active?.title}-${id}-${active?.index}`}
								ref={ref}
								className="w-full max-w-[500px]  h-full md:h-fit md:max-h-[90%]  flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden">
								<motion.div layoutId={`image-${active?.title}-${id}-${active?.index}`}>
									<Image
										priority
										width={2000}
										height={2000}
										src={active?.src}
										alt={active?.title}
										className="w-full aspect-square sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-center"
									/>
								</motion.div>

								<div>
									<div className="flex justify-between items-start p-5">
										<div className="">
											<motion.h3
												layoutId={`title-${active?.title}-${id}-${active?.index}`}
												className="font-medium text-neutral-700 dark:text-neutral-200 text-base">
												{active?.title}
											</motion.h3>
											<motion.p
												layoutId={`description-${active?.description}-${id}-${active?.index}`}
												className="text-neutral-600 dark:text-neutral-400 text-base">
												{active?.description}
											</motion.p>
										</div>
										<MotionLink
											layout
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											href={active?.ctaLink}
											className="px-4 py-2 my-auto text-sm rounded-full font-bold bg-primary duration-150 md:hover:bg-red-500 text-white">
											{active?.ctaText}
										</MotionLink>
									</div>
									{active?.content && (
										<div className="relative px-5">
											<motion.div
												layout
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-5 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]">
												{typeof active?.content === "function" ? active?.content() : active?.content}
											</motion.div>
										</div>
									)}
								</div>
							</motion.div>
						</div>
					) : null}
				</AnimatePresence>
				<ul className="max-w-7xl mx-auto px-5 w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4 items-start gap-4">
					{people.map((card, index) => (
						<motion.div
							layoutId={`card-${card.title}-${id}-${index}`}
							key={id + index}
							onClick={() => {
								if (card.title) setActive(active === card ? null : { ...card, index });
							}}
							className="p-4 flex flex-col hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer">
							<div className="flex gap-4 flex-col  w-full">
								<motion.div layoutId={`image-${card.title}-${id}-${index}`}>
									<Image
										width={2000}
										height={2000}
										quality={100}
										src={card.src}
										alt={card.title}
										className="w-full aspect-square rounded-lg object-cover object-top"
									/>
								</motion.div>
								<div className="flex justify-center items-center flex-col">
									<motion.h3
										layoutId={`title-${card.title}-${id}-${index}`}
										className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-base">
										{card.title}
									</motion.h3>
									<motion.p
										layoutId={`description-${card.description}-${id}-${index}`}
										className="text-neutral-600 dark:text-neutral-400 text-center md:text-center text-base">
										{card.description}
									</motion.p>
								</div>
							</div>
						</motion.div>
					))}
				</ul>
			</>
		);
}

export const CloseIcon = () => {
	return (
		<motion.svg
			initial={{
				opacity: 0,
			}}
			animate={{
				opacity: 1,
			}}
			exit={{
				opacity: 0,
				transition: {
					duration: 0.05,
				},
			}}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="h-4 w-4 text-black">
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path d="M18 6l-12 12" />
			<path d="M6 6l12 12" />
		</motion.svg>
	);
};
