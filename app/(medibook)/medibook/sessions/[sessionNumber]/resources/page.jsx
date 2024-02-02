import { TopBar } from "@/components/medibook/TopBar";
import { Frame } from "@/components/medibook/Frame";
import { Card, CardHeader, CardBody, Spacer, AvatarGroup, CardFooter, Divider, Link, Chip, Image, ButtonGroup, Button } from "@nextui-org/react";
import { authorize, s } from "@/lib/authorize";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as SolarIconSet from "solar-icon-set";
import { notFound } from "next/navigation";
import prisma from "@/prisma/client";
import SearchBar from "./SearchBar";
import Modal from "./Modal";
import FilesTable from "./FilesTable";

export default async function Page({ params, searchParams }) {
	const session = await getServerSession(authOptions);
	const files = await prisma.sessionResource.findMany({
		where: { session: { number: params.sessionNumber } },
		orderBy: [{ name: "asc" }],
	});
	return (
		<>
			<Modal sessionNumber={params.sessionNumber} />
			<TopBar title="Session Resources">
				{authorize(session, [s.management]) && (
					<Button as={Link} href="?add">
						Add File
					</Button>
				)}
			</TopBar>
			<Frame>
				<SearchBar />
				<Spacer y={4} />
				<FilesTable session={session} files={files} />
			</Frame>
		</>
	);
}
