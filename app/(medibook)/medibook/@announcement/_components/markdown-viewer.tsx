"use client";

import { announcementWebsitecomponents } from "../default";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { serialize } from "next-mdx-remote-client/serialize";
import dynamic from "next/dynamic";

const MDXClient = dynamic(() => import("next-mdx-remote-client/csr").then((mod) => mod.MDXClient), { ssr: false });

export function MarkDownViewer({ markdown, disableToast = false, ...props }) {
	const [serializedMarkDown, setSerializedMarkDown] = useState({});
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		const createPreview = async () => {
			if (!disableToast) {
				toast.loading("Creating Preview.", {
					id: "preview",
				});
			}
			const content = await serialize({ source: markdown });
			setSerializedMarkDown(content);
			if (!disableToast) {
				toast.success("Preview Created.", {
					id: "preview",
				});
			}
		};

		if (markdown) createPreview();
	}, [markdown]);

	useEffect(() => {
		setIsMounted(true);
		return () => setIsMounted(false);
	}, []);

	if (serializedMarkDown && markdown && isMounted)
		return (
			<Suspense fallback={<div>Loading...</div>}>
				<MDXClient compiledSource="" {...props} components={announcementWebsitecomponents} {...serializedMarkDown} />
			</Suspense>
		);
	return null;
}
