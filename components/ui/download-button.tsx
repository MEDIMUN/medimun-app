"use client";

import { forceDownloadFile } from "@/app/(website)/sessions/[sessionNumber]/albums/utils/downloadPhoto";
import { Button } from "../button";
import { DropdownItem } from "../dropdown";

export function DownloadButton({ href, ...props }) {
	return (
		<Button
			{...props}
			onClick={() => {
				forceDownloadFile(href, props.filename);
			}}
			download
			rel="noopener noreferrer"
		/>
	);
}

export function DownloadDropdownItem({ href, ...props }) {
	return (
		<DropdownItem
			{...props}
			onClick={() => {
				forceDownloadFile(href, props.filename);
			}}
			download
			rel="noopener noreferrer"
		/>
	);
}
