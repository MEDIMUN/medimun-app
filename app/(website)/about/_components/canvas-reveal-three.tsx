"use client";
import React from "react";

import { AnimatePresence, motion } from "framer-motion";
import { CanvasRevealEffect } from "./canvas-reveal-effect";
import { FastLink } from "@/components/fast-link";

function Title({ title }) {
	return (
		<div className="flex gap-2 align-bottom text-white">
			<p className="!text-4xl text-white">{title}</p>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mb-2 mt-auto">
				<path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
			</svg>
		</div>
	);
}

export function CanvasRevealEffectThree() {
	return (
		<>
			<div className="font-[Gilroy] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center gap-8 px-4 md:px-8 justify-center max-w-7xl  w-full mx-auto">
				<FastLink prefetch={true} href="/about/people">
					<Card description="Meet the minds behind our conference." icon={<Title title="our people" />}>
						<CanvasRevealEffect animationSpeed={5.1} containerClassName="bg-emerald-900" />
					</Card>
				</FastLink>
				<FastLink prefetch={true} href="/about/history">
					<Card description="Explore the history of our conference." icon={<Title title="our history" />}>
						<CanvasRevealEffect
							animationSpeed={3}
							containerClassName="bg-black"
							colors={[
								[236, 72, 153],
								[232, 121, 249],
							]}
							dotSize={2}
						/>
						<div className="absolute inset-0 [mask-image:radial-gradient(400px_at_center,white,transparent)] bg-black/90" />
					</Card>
				</FastLink>
				<FastLink prefetch={true} href="/about/mission">
					<Card icon={<Title title="our mission" />} description="Discover the values that drive our conference.">
						<CanvasRevealEffect animationSpeed={3} containerClassName="bg-sky-600" colors={[[125, 211, 252]]} />
					</Card>
				</FastLink>
			</div>
		</>
	);
}

const Card = ({ description, icon, children }: { description: string; icon: React.ReactNode; children?: React.ReactNode }) => {
	const [hovered, setHovered] = React.useState(false);
	return (
		<div
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			className="border  group/canvas-card flex items-center justify-center border-white/[0.2] w-auto p-8 relative h-[30rem]">
			<Icon className="absolute h-6 w-6 -top-3 -left-3 text-white " />
			<Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-white " />
			<Icon className="absolute h-6 w-6 -top-3 -right-3 text-white " />
			<Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-white" />

			<AnimatePresence>
				{hovered && (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full w-full absolute inset-0">
						{children}
					</motion.div>
				)}
			</AnimatePresence>

			<div className="relative z-20">
				<div className="text-center group-hover/canvas-card:-translate-y-4 group-hover/canvas-card:opacity-0 transition duration-200 w-full  mx-auto flex items-center justify-center">
					{icon}
				</div>
				<h2 className="text-white text-xl text-center opacity-0 group-hover/canvas-card:opacity-100 relative z-10  mt-4  font-bold group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200">
					{description}
				</h2>
			</div>
		</div>
	);
};

export const Icon = ({ className, ...rest }: any) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className} {...rest}>
			<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
		</svg>
	);
};
