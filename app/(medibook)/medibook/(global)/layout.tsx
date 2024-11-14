import React, { cloneElement, isValidElement, Fragment } from "react";

export default function Layout({ children }) {
	return (
		<div className="grow lg:rounded-lg relative  min-h-max lg:bg-white lg:shadow-sm lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
			<div className="mx-auto p-6 min-h-max flex lg:p-10 max-w-6xl h-full flex-col gap-6">{children}</div>
		</div>
	);
}
