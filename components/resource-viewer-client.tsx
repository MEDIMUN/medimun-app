"use client";

import { useEffect, useState } from "react";

export function ResourceViewerClient({ resource, presignedUrl }: { resource: any; presignedUrl: string | null }) {
	const [frame, setFrame] = useState<JSX.Element | null>(null);

	useEffect(() => {
		if (!resource) return;

		const mimeTypesGoogleDocsCanOpen = [
			"application/vnd.google-apps.document",
			"application/vnd.google-apps.spreadsheet",
			"application/vnd.google-apps.presentation",
			"application/vnd.google-apps.drawing",
			"application/vnd.google-apps.script",
			"application/pdf",
		];

		const mimeTypesMicrosoftOfficeCanOpen = [
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"application/vnd.ms-excel",
			"application/vnd.openxmlformats-officedocument.presentationml.presentation",
			"application/vnd.ms-powerpoint",
		];

		const mimeTypesOfImagesImgCanOpen = ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp"];

		const mimeTypesNativeIframeCanOpen = [];

		let newFrame: JSX.Element | null = null;

		if (resource.driveUrl) {
			newFrame = <iframe src={resource.driveUrl} width="100%" height="100%"></iframe>;
		} else if (presignedUrl) {
			if (mimeTypesMicrosoftOfficeCanOpen.includes(resource.mimeType)) {
				newFrame = (
					<iframe
						src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(presignedUrl)}`}
						className="min-h-[1000px] w-full max-w-screen"
						height="100%"></iframe>
				);
			} else if (mimeTypesGoogleDocsCanOpen.includes(resource.mimeType)) {
				newFrame = (
					<iframe
						src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(presignedUrl)}`}
						className="min-h-[1000px] w-full max-w-screen"
						height="100%"></iframe>
				);
			} else if (mimeTypesOfImagesImgCanOpen.includes(resource.mimeType)) {
				newFrame = <img src={presignedUrl} alt="Image" />;
			} else if (mimeTypesNativeIframeCanOpen.includes(resource.mimeType)) {
				newFrame = <object className="min-h-[1000px] max-w-screen" data={presignedUrl} height="100%"></object>;
			} else {
				newFrame = <a href={presignedUrl}>Download</a>;
			}
		}

		setFrame(newFrame);

		// Prevent iframe from modifying browser history
		window.history.replaceState(null, "", window.location.href);
	}, [resource, presignedUrl]);

	return <div className="min-h-[1000px] p-4 max-w-4xl w-full mx-auto rounded-xl overflow-hidden">{frame}</div>;
}
