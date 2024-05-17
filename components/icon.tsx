"use client";

import { Icon as Iconify } from "@iconify/react";

export function Icon({ icon, className = "", width, ...props }) {
	return <Iconify icon={icon} className={className} width={width} {...props} />;
}

export default Icon;
