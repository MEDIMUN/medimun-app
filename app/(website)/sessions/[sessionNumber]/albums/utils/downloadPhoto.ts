import { toast } from "sonner";

function forceDownload(blob: Blob, filename: string) {
	const blobUrl = window.URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.download = filename;
	a.href = blobUrl;
	document.body.appendChild(a);
	a.click();
	a.remove();
	window.URL.revokeObjectURL(blobUrl);
}

export default async function downloadPhoto(url: string, filename: string) {
	if (!filename) {
		filename = url.split("\\").pop()?.split("/").pop() || "download";
	}
	toast.loading("Downloading...", {
		id: "download",
	});

	try {
		// Encode the URL to be used as a parameter in the API route
		const encodedUrl = encodeURIComponent(url);

		// Use the API route to fetch the file
		const response = await fetch(`/api/get-file/${encodedUrl}`);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const blob = await response.blob();
		forceDownload(blob, filename);
	} catch (e) {
		toast.error("Download failed", {
			id: "download",
		});
		return;
	}
	toast.success("Download complete!", {
		id: "download",
	});
}
