"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import DelegatesImage from "@/public/assets/images/plenary-flags.jpg";

export const ColorRevealImage = () => {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [isHovered, setIsHovered] = useState(false);
	const containerRef = useRef(null);

	const handleMouseMove = (e) => {
		const rect = containerRef.current.getBoundingClientRect();
		setMousePosition({
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		});
	};

	useEffect(() => {
		// Check if the mouse is already inside the container on mount
		const handleInitialHover = (e) => {
			if (containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect();
				const isInside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

				if (isInside) {
					setMousePosition({
						x: e.clientX - rect.left,
						y: e.clientY - rect.top,
					});
					setIsHovered(true);
				}
			}
		};

		window.addEventListener("mousemove", handleInitialHover);
		return () => {
			window.removeEventListener("mousemove", handleInitialHover);
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className="absolute w-[50%] right-0 h-full overflow-hidden reveal-container"
			onMouseMove={handleMouseMove}
			onMouseLeave={() => setIsHovered(false)}>
			{isHovered && (
				<div className="absolute inset-0 animate-appearance-in">
					<div
						className="absolute h-64 w-64 rounded-full animate-appearance-in ring-1 ring-black pointer-events-none"
						style={{
							top: mousePosition.y - 128,
							left: mousePosition.x - 128,
							background: `radial-gradient(circle, rgba(0,0,0,0) 75%, black 76%)`,
						}}
					/>

					<div
						className="absolute inset-0"
						style={{
							clipPath: `circle(128px at ${mousePosition.x}px ${mousePosition.y}px)`,
						}}>
						<Image
							src={DelegatesImage}
							alt="Delegates standing outside to take a conference photo."
							className="h-full scale-x-[-1] w-full object-cover"
						/>
					</div>
				</div>
			)}
		</div>
	);
};
