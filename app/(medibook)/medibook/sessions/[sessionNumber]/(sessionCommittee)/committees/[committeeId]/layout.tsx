import prisma from "@/prisma/client";
import { Navbar } from "./Navbar";
import { notFound } from "next/navigation";

export default async function SessionLayout({ children, params }) {
	const selectedCommittee = await prisma.committee
		.findFirstOrThrow({
			where: {
				OR: [
					{
						session: { number: params.sessionNumber },
						id: params.committeeId,
					},
					{
						session: { number: params.sessionNumber },
						slug: params.committeeId,
					},
				],
			},
			include: {
				session: {
					select: {
						number: true,
					},
				},
				chair: {
					select: {
						user: true,
					},
				},
			},
		})
		.catch(notFound);

	return (
		<>
			<Navbar selectedCommittee={selectedCommittee} />
			{children}
		</>
	);
}
