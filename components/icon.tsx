"use client";

import { Icon as Iconify } from "@iconify/react";

export function Icon({ icon, className = "", width = null, height = null, ...props }) {
	return <Iconify icon={icon} height={height} className={className} width={width} {...props} />;
}

export default Icon;
