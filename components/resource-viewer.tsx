// components/ResourceViewerServer.tsx
import prisma from "@/prisma/client";
import { minio } from "@/minio/client";
import { ResourceViewerClient } from "./resource-viewer-client";

export async function ResourceViewer({ resourceId }: { resourceId: string }) {
	const selectedResource = await prisma.resource.findFirst({
		where: { id: resourceId },
	});

	if (!selectedResource) {
		return <div></div>;
	}

	let presignedUrl = null;

	if (selectedResource.fileId) {
		const minioClient = minio();
		try {
			presignedUrl = await minioClient.presignedGetObject(process.env.BUCKETNAME!, `resources/${selectedResource.fileId}`, 30 * 60);
		} catch (error) {
			console.error("Error generating MinIO presigned URL:", error);
		}
	}

	return <ResourceViewerClient resource={selectedResource} presignedUrl={presignedUrl} />;
}
