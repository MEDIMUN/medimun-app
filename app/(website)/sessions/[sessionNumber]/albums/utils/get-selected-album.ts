import prisma from "@/prisma/client";

export async function getSelectedAlbum(props) {
	const albumId = (await props.params).albumId;
	const sessionNumber = (await props.params).sessionNumber;
	const album = await prisma.album.findFirst({
		where: {
			OR: [{ id: albumId }, { slug: albumId }],
			session: { number: sessionNumber },
		},
		include: { session: { select: { number: true, numberInteger: true } } },
	});
	return album;
}
