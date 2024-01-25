"use client";

import { NextUIProvider as NUIP } from "@nextui-org/react";
import { useRouter } from "next/navigation";

export function NextUIProvider({ children }) {
	const router = useRouter();
	return <NUIP navigate={router.push}>{children}</NUIP>;
}
