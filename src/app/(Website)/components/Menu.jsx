"use client";

import { useState } from "react";
import style from "./styles/Menu.module.css";
import Link from "next/link";
import Logo from "./Logo";

export default function Menu({ props }) {
	const { isVisable, setIsVisable } = props;

	return (
		<menu className={style.menu}>
			<div className={isVisable ? style.in : style.out}>
				<div className={style.branding}>
					<Link href="/">
						<div className={style.logo}>
							<Logo color="black" quality={100} />
						</div>
					</Link>
					<div className={style.close} onClick={() => setIsVisable(false)}>
						<svg
							viewBox="0 0 24 24"
							width="24"
							height="24"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							fill="none"
							shapeRendering="geometricPrecision">
							<path d="M18 6L6 18"></path>
							<path d="M6 6l12 12"></path>
						</svg>
					</div>
				</div>
				<div className={style.grid}></div>
				<div className={style.quickAccess}></div>
			</div>
		</menu>
	);
}
