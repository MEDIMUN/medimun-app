"use client";

import { useState } from "react";
import AvatarMenu from "./AvatarMenu";

export default function NavOptions() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<div className="my-[6px] h-[32px] pr-[24px]">
				<AvatarMenu />
			</div>
		</>
	);
}
