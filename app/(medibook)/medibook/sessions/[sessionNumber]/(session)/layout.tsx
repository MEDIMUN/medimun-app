import prisma from "@/prisma/client";
import { Navbar } from "./Navbar";
import { notFound } from "next/navigation";

export default async function SessionLayout({ children, params }) {
	const selectedSession = await prisma.session
		.findFirstOrThrow({
			where: { number: params.sessionNumber },
		})
		.catch(notFound);

	const delegateCount = await prisma.delegate.count({
		where: {
			committee: {
				session: {
					number: params.sessionNumber,
				},
			},
		},
	});

	const memberCount = await prisma.member.count({
		where: {
			department: {
				session: {
					number: params.sessionNumber,
				},
			},
		},
	});

	console.log(memberCount);

	return (
		<>
			<Navbar selectedSession={selectedSession} />
			<div className="mx-auto flex min-h-[calc(100svh-205px)] flex-col gap-4 p-4 md:px-5">{children}</div>
		</>
	);
}
