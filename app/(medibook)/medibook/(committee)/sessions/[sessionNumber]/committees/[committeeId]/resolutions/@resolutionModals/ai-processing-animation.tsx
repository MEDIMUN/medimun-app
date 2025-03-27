"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIProcessingAnimation() {
	const [dots, setDots] = useState<number[]>([]);

	// Add and remove dots in a continuous pattern
	useEffect(() => {
		const interval = setInterval(() => {
			setDots((prev) => {
				// Create a random pattern of dots
				const newDots = [...prev];

				// Add a new dot at a random position
				if (newDots.length < 20) {
					const newPosition = Math.floor(Math.random() * 36);
					if (!newDots.includes(newPosition)) {
						newDots.push(newPosition);
					}
				}

				// Remove a random dot
				if (newDots.length > 5 && Math.random() > 0.5) {
					const indexToRemove = Math.floor(Math.random() * newDots.length);
					newDots.splice(indexToRemove, 1);
				}

				return newDots;
			});
		}, 300);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="relative w-48 h-48">
			{/* Pulsing background circle */}
			<motion.div
				className="absolute inset-0 rounded-full bg-[#AE2D28]/10"
				animate={{
					scale: [1, 1.05, 1],
				}}
				transition={{
					duration: 2,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
				}}
			/>

			{/* Central AI icon */}
			<div className="absolute inset-0 flex items-center justify-center">
				<motion.div
					className="w-16 h-16 rounded-full bg-gradient-to-br from-[#AE2D28] to-[#8A2521] flex items-center justify-center shadow-lg"
					animate={{
						boxShadow: ["0 0 0 0 rgba(174, 45, 40, 0.5)", "0 0 0 10px rgba(174, 45, 40, 0)"],
					}}
					transition={{
						duration: 2,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}>
					<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
						/>
					</svg>
				</motion.div>
			</div>

			{/* Grid of dots representing data processing */}
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="w-full h-full grid grid-cols-6 grid-rows-6">
					<AnimatePresence>
						{dots.map((position, index) => (
							<motion.div
								key={`${position}-${index}`}
								className="flex items-center justify-center"
								initial={{ opacity: 0, scale: 0 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0 }}
								transition={{ duration: 0.3 }}
								style={{
									gridColumn: (position % 6) + 1,
									gridRow: Math.floor(position / 6) + 1,
								}}>
								<div className="w-2 h-2 rounded-full bg-[#AE2D28]" />
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</div>

			{/* Rotating outer ring */}
			<motion.div
				className="absolute inset-0 rounded-full border-2 border-[#AE2D28]/40 border-dashed"
				animate={{
					rotate: 360,
				}}
				transition={{
					duration: 20,
					repeat: Number.POSITIVE_INFINITY,
					ease: "linear",
				}}
			/>

			{/* Timer */}
			<div className="absolute -bottom-8 left-0 right-0 text-center">
				<Timer />
			</div>
		</div>
	);
}

function Timer() {
	const [seconds, setSeconds] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setSeconds((prev) => prev + 1);
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;

	const formattedTime = `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;

	return (
		<div className="text-sm font-medium text-[#AE2D28]">
			<span className="font-mono">{formattedTime}</span>
		</div>
	);
}
