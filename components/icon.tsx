"use client";

import { Icon as Iconify } from "@iconify/react";
import React from "react";

export function Icon({
	icon,
	className = "",
	width = undefined,
	height = undefined,
	slot = null,
	...props
}: {
	slot?: string | null;
	icon: string;
	className?: string;
	width?: number | string | undefined;
	height?: number | string | undefined;
	props?: React.ComponentProps<typeof Iconify>;
}) {
	return <Iconify slot={slot} icon={icon} height={height} className={className} width={width} {...props} />;
}

export default Icon;
