"use client";

import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

export function StatsCard({ title, value, className = "", ...others }) {
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (value === 0) return;

		let start = Date.now();
		const totalTime = 1500; // Total animation time in ms

		const updateCount = () => {
			const elapsed = Date.now() - start;
			const progress = elapsed / totalTime;
			const currentCount = Math.min(Math.floor(value * progress), value);
			setCount(currentCount);

			if (currentCount < value) {
				requestAnimationFrame(updateCount);
			}
		};
		requestAnimationFrame(updateCount);
	}, [value]);

	return (
		<div {...others} className={cn("flex animate-appearance-in flex-col bg-content1/50 p-4", className)}>
			<h2 className="bg-gradient-to-br from-foreground-800 to-foreground-500 bg-clip-text text-5xl font-semibold tracking-tight text-transparent dark:to-foreground-200 lg:inline-block">
				{count}
			</h2>
			<p className="mt-auto font-[200]">{title}</p>
		</div>
	);
}
