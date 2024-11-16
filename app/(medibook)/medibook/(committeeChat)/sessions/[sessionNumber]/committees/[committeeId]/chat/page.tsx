import { auth } from "@/auth";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { ChatLayout } from "./client-components";
import { Committee } from "@prisma/client";

export type SelectedGroupProps = Committee & {
	session: {
		number: number;
	};
	delegate: {
		country: string;
		user: {
			officialName: string;
			officialSurname: string;
			displayName: string;
			id: string;
		};
	};
	CommitteeMessage: {
		createdAt: Date;
		id: string;
		user: {
			id: string;
			officialName: string;
			officialSurname: string;
			displayName: string;
		};
		CommitteeMessageReaction: {
			user: {
				id: string;
				officialName: string;
				officialSurname: string;
				displayName: string;
			};
		}[];
		replyTo: {
			user: {
				id: string;
				officialName: string;
				officialSurname: string;
				displayName: string;
			};
		};
	}[];
};

export default async function MessagePage(props) {
	const params = await props.params;
	const committeeId = params.committeeId;
	const sessionNumber = params.sessionNumber;
	const authSession = await auth();
	if (!authSession) notFound();

	const selectedGroup = await prisma.committee
		.findFirstOrThrow({
			where: {
				OR: [{ id: committeeId }, { slug: committeeId }],
				session: { number: sessionNumber },
			},
			include: {
				session: {
					select: { number: true },
				},
				delegate: {
					select: {
						country: true,
						user: {
							select: {
								officialName: true,
								officialSurname: true,
								displayName: true,
								id: true,
							},
						},
					},
				},
				CommitteeMessage: {
					orderBy: { createdAt: "desc" },
					take: 50,
					include: {
						user: { select: { id: true, officialName: true, officialSurname: true, displayName: true } },
						CommitteeMessageReaction: { include: { user: { select: { id: true, officialName: true, officialSurname: true, displayName: true } } } },
						replyTo: {
							include: {
								user: { select: { id: true, officialName: true, officialSurname: true, displayName: true } },
							},
						},
					},
				},
			},
		})
		.catch(notFound);

	return <ChatLayout authSession={authSession} selectedGroup={selectedGroup} />;
}
