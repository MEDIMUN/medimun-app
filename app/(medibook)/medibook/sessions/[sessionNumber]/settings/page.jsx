import { TopBar } from "@/components/medibook/TopBar";
import { Frame } from "@/components/medibook/Frame";
import { SettingsForm } from "./SettingsForm";
import prisma from "@/prisma/client";

export default async function Page({ params }) {
	const selectedSession = await prisma.session.findUniqueOrThrow({
		where: {
			number: params.sessionNumber,
		},
	});
	const days = await prisma.day.findMany({
		where: {
			session: {
				number: params.sessionNumber,
			},
		},
		orderBy: {
			date: "asc",
		},
	});
	return (
		<>
			<TopBar title="Settings"></TopBar>
			<Frame>
				<SettingsForm days={days} selectedSession={selectedSession} />
			</Frame>
		</>
	);
}
