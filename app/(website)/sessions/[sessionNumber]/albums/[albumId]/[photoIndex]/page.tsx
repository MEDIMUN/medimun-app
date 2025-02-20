import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Carousel from "./_components/Carousel";
import { romanize } from "@/lib/romanize";
import { unstable_cacheLife as cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { getAllImageFiles } from "../../utils/get-all-image-files";
import { getSelectedAlbum } from "../../utils/get-selected-album";

export async function generateMetadata(props) {
	const { photoIndex, sessionNumber } = await props.params;
	const searchParams = await props.searchParams;
	const isShare = typeof searchParams.share === "string";
	const selectedAlbum = await getSelectedAlbum(props);
	if (!selectedAlbum || !selectedAlbum.driveFolderId) notFound();
	const allImageFiles = await getAllImageFiles(selectedAlbum.driveFolderId);
	const currentPhoto = allImageFiles[Number(photoIndex - 1)];
	const thumbnailUrl = `https://drive.google.com/thumbnail?id=${currentPhoto.id}&sz=w1200-h630`;
	const encodedThumbnailUrl = encodeURIComponent(thumbnailUrl);
	const currentPhotoUrl = `https://www.medimun.org/api/get-file/${encodedThumbnailUrl}?noLogo=true`;
	if (isShare)
		return {
			title: `Photo ${photoIndex} from Album "Conference Photos" | Session ${romanize(sessionNumber)} | MEDIMUN`,
			description: "Photos from the MEDIMUN session",
			openGraph: {
				title: `Photo ${photoIndex} from Session ${romanize(sessionNumber)}`,
				images: [
					{
						url: currentPhotoUrl,
						alt: `Photo ${photoIndex} from Session ${romanize(sessionNumber)}`,
					},
				],
			},
		};
	return {
		title: `Conference Photos | Session ${romanize(sessionNumber)} Albums`,
		description: "Photos from the MEDIMUN session",
	};
}

export default async function Home(props) {
	const { photoIndex, sessionNumber, albumId } = await props.params;
	let index = Number(photoIndex - 1);
	const selectedAlbum = await getSelectedAlbum(props);
	if (!selectedAlbum || !selectedAlbum.driveFolderId) notFound();
	const folderId = selectedAlbum.driveFolderId;
	let allImageFiles = await getAllImageFiles(folderId);

	//getIndex and handle
	const currentPhoto = allImageFiles[index];

	const currentPhotoUrl = `https://drive.google.com/uc?id=${currentPhoto.id}&export=view`;

	return (
		<main className="mx-auto max-w-[1960px] p-4">
			<Carousel sessionNumber={sessionNumber} albumId={albumId} images={allImageFiles} currentPhoto={currentPhoto} index={index} />
		</main>
	);
}
