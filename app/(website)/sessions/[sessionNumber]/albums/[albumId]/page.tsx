import { cache, Suspense } from "react";
import { Topbar } from "@/app/(website)/server-components";
import Image from "next/image";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { romanize } from "@/lib/romanize";
import { unstable_cacheLife as cacheLife } from "next/cache";
import { getAllImageFiles } from "../utils/get-all-image-files";
import { getSelectedAlbum } from "../utils/get-selected-album";
import { FastLink } from "@/components/fast-link";

export default function Page(props) {
	return (
		<Suspense fallback={<Topbar title="Loading..." />}>
			<Gallery {...props} />
		</Suspense>
	);
}

export async function generateMetadata(props) {
	const album = await getSelectedAlbum(props);
	if (!album) notFound();
	return {
		title: `${album.name} | Session ${romanize(album.session.numberInteger)} Albums | MEDIMUN`,
		description: album.description,
	};
}

async function Gallery(props) {
	const albumId = (await props.params).albumId;

	const selectedAlbum = await getSelectedAlbum(props);
	if (!selectedAlbum) notFound();
	const folderId = selectedAlbum.driveFolderId;
	if (!folderId) return [];

	let allImageFiles = await getAllImageFiles(folderId);

	return (
		<>
			<Topbar
				buttonText={`Session ${romanize(selectedAlbum.session.numberInteger)} Albums`}
				buttonHref={`/sessions/${selectedAlbum.session.number}/albums`}
				title={selectedAlbum.name}
				description={`${allImageFiles.length} Photos ${selectedAlbum?.description ? " • " : ""}${selectedAlbum?.description ? selectedAlbum?.description : ""}`}
			/>
			{allImageFiles.length === 0 && <p className="p-4">No images found in folder.</p>}
			<main className="mx-auto max-w-[1960px] p-4">
				<div className="columns-2 gap-4 sm:columns-3 xl:columns-4 2xl:columns-5 3xl:columns-6">
					{allImageFiles.map((file: any, index) => {
						const customThumbnailLink = `https://drive.google.com/thumbnail?id=${file.id}&sz=w480-h480`;
						return (
							<FastLink
								id={(index + 1).toString()}
								key={file.id}
								href={`./${albumId}/${index + 1}`}
								className="after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight">
								<Image
									alt="Next.js Conf photo"
									className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
									style={{ transform: "translate3d(0, 0, 0)" }}
									src={customThumbnailLink}
									width={720}
									height={480}
									sizes="(max-width: 640px) 100vw,
                  (max-width: 1280px) 50vw,
                  (max-width: 1536px) 33vw,
                  25vw"
								/>
							</FastLink>
						);
					})}
				</div>
			</main>
		</>
	);
}
