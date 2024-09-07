"use client";

import { Badge } from "@/components/badge";
import { Divider } from "@/components/divider";
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
		<div>
			<Divider />
			<div className="mt-6 text-lg/6 font-medium sm:text-sm/6">{title}</div>
			<div className="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">{count}</div>
			<div className="mt-3 text-sm/6 sm:text-xs/6">
				<Badge color={"change".startsWith("+") ? "lime" : "pink"}>{"change"}</Badge> <span className="text-zinc-500">from last week</span>
			</div>
		</div>
	);
}

export function Stat({ title, value, change }: { title: string; value: string; change: string }) {
	return (
		<div>
			<Divider />
			<div className="mt-6 text-lg/6 font-medium sm:text-sm/6">{title}</div>
			<div className="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">{value}</div>
			<div className="mt-3 text-sm/6 sm:text-xs/6">
				<Badge color={change.startsWith("+") ? "lime" : "pink"}>{change}</Badge> <span className="text-zinc-500">from last week</span>
			</div>
		</div>
	);
}
