"use client";

import { Tabs } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function RefreshTabList({ children }) {
	const [selectedTab, setSelectedTab] = useState("view");
	const router = useRouter();

	useEffect(() => {
		router.refresh();
	}, [selectedTab]);

	return (
		<Tabs value={selectedTab} onValueChange={(val) => setSelectedTab(val)} className="w-full">
			{children}
		</Tabs>
	);
}
