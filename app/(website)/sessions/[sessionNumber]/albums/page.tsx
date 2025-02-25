import { Suspense } from "react";
import { Topbar } from "@/app/(website)/server-components";
import Image from "next/image";
import { FastLink } from "@/components/fast-link";
import prisma from "@/prisma/client";
import { Badge } from "@/components/badge";
import { authorize, authorizePerSession, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { connection } from "next/server";
import { romanize } from "@/lib/romanize";

export default function Page(props) {
	return (
		<Suspense fallback={<Topbar title="Session Albums" description="Loading..." buttonText=" Back to Session" buttonHref="./" />}>
			<AlbumsPage {...props} />
		</Suspense>
	);
}

export async function generateMetadata(props) {
	const params = await props.params;
	return {
		title: `Session ${romanize(Number(params.sessionNumber))} Albums`,
		description: "View all photo albums from this session.",
	};
}

export async function AlbumsPage(props) {
	await connection();
	const params = await props.params;
	const sessionNumber = params.sessionNumber;
	const authSession = await auth();

	const albums = await prisma.album.findMany({
		where: {
			session: {
				number: sessionNumber,
			},
		},
		orderBy: {
			name: "asc",
		},
	});

	const isManagement = authorize(authSession, [s.management]);
	const isChair = (authSession && authorizePerSession(authSession, [s.chair], [sessionNumber])) || isManagement;
	const isManager = (authSession && authorizePerSession(authSession, [s.manager], [sessionNumber])) || isManagement;
	const isMember = (authSession && authorizePerSession(authSession, [s.member], [sessionNumber])) || isManagement;
	const isSecretaryGeneral = (authSession && authorizePerSession(authSession, [s.sg], [sessionNumber])) || isManagement;
	const isPresidentOfTheGeneralAssembly = (authSession && authorizePerSession(authSession, [s.pga], [sessionNumber])) || isManagement;
	const isVicePresidentOfTheGeneralAssembly = (authSession && authorizePerSession(authSession, [s.dpga], [sessionNumber])) || isManagement;
	const isDeputySecretaryGeneral = (authSession && authorizePerSession(authSession, [s.dsg], [sessionNumber])) || isManagement;
	const isSchoolDirector = authSession && (authorize(authSession, [s.sd]) || isManagement || authorizePerSession(authSession, [s.sd], [sessionNumber]));

	const isSecretariat = isSecretaryGeneral || isDeputySecretaryGeneral || isPresidentOfTheGeneralAssembly || isVicePresidentOfTheGeneralAssembly;

	const numberOfVisibleAlbums = albums.filter((album) => {
		let isAllowed = false;

		if (album.privacy === "NORMAL") {
			isAllowed = true;
		} else if (album.privacy === "MANAGEMENT") {
			isAllowed = isManagement || isSecretariat;
		} else if (album.privacy === "ORGANIZERS") {
			isAllowed = isManagement || isSecretariat || isMember || isManager || isChair;
		} else if (album.privacy === "SCHOOLDIRECTORS") {
			isAllowed = isSchoolDirector || isManagement || isSecretariat;
		}

		return isAllowed;
	}).length;

	return (
		<>
			<Topbar
				title="Session Albums"
				description={`${numberOfVisibleAlbums} Albums.${!authSession && " Some albums may be hidden as you are not logged in."}`}
				buttonText={`Session ${romanize(Number(sessionNumber))}`}
				buttonHref={`/sessions/${sessionNumber}`}
			/>
			<main className="mx-auto max-w-7xl">
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 w-full flex-row gap-4 p-4 md:p-8">
					{albums.map((album, index) => {
						const thumbnailUrl = `https://drive.google.com/thumbnail?id=${album.cover}&sz=w1200-h630`;
						const encodedThumbnailUrl = encodeURIComponent(thumbnailUrl);
						let isAllowed = false;

						if (album.privacy === "NORMAL") {
							isAllowed = true;
						} else if (album.privacy === "MANAGEMENT") {
							isAllowed = isManagement || isSecretariat;
						} else if (album.privacy === "ORGANIZERS") {
							isAllowed = isManagement || isSecretariat || isMember || isManager || isChair;
						} else if (album.privacy === "SCHOOLDIRECTORS") {
							isAllowed = isSchoolDirector || isManagement || isSecretariat;
						}

						if (isAllowed)
							return (
								<FastLink
									id={album.id}
									key={album.id}
									href={`./albums/${album?.slug || album.id}`}
									className="after:content group cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight">
									<div
										style={{
											background: `url("/api/get-file/${encodedThumbnailUrl}?noLogo=true")`,
											backgroundSize: "cover",
											transform: "translate3d(0, 0, 0)",
										}}
										className="transform bg-cover object-cover md:grayscale hover:grayscale-0 align-bottom flex flex-col relative h-64 w-full rounded-lg brightness-90 transition  will-change-auto group-hover:brightness-110">
										<h2 className="font-[montserrat] mt-auto text-2xl p-4 max-w-[256px] font-semibold relative">
											<span className="bg-white text-black">{album.name}</span>
										</h2>
										{album.privacy !== "NORMAL" && <Badge className="absolute font-[montserrat] !bg-primary top-4 right-4">{album.privacy} ONLY</Badge>}
									</div>
								</FastLink>
							);
					})}
				</div>
			</main>
		</>
	);
}
