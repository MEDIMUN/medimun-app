import { auth } from "@/auth";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { ChatLayout } from "./client-components";
import { generateUserData, generateUserDataObject } from "@/lib/user";

export default async function MessagePage(props) {
	const params = await props.params;
	const groupId = decodeURIComponent(params.groupId);
	const authSession = await auth();
	if (!authSession) notFound();
	let selectedGroup = null as any;
	if (groupId.includes("@")) {
		const atRemoved = groupId.replace("@", "");

		const selectedUser = await prisma.user
			.findFirstOrThrow({
				where: {
					OR: [{ id: atRemoved }, { username: atRemoved }],
				},
			})
			.catch(notFound);

		selectedGroup = await prisma.group
			.findFirst({
				where: { GroupMember: { every: { userId: { in: [authSession.user.id, selectedUser.id] } } } },
				include: {
					GroupMember: { include: { user: { include: { ...generateUserDataObject() } } } },
					Message: {
						orderBy: { createdAt: "desc" },
						take: 50,
						include: {
							user: { select: { id: true, officialName: true, officialSurname: true, displayName: true } },
							MessageReaction: { include: { user: { select: { id: true, officialName: true, officialSurname: true, displayName: true } } } },
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

		if (!selectedGroup) {
			selectedGroup = await prisma.group.create({
				data: {
					GroupMember: {
						create: [{ userId: authSession.user.id }, { userId: selectedUser.id }],
					},
				},
				include: {
					GroupMember: { include: { user: { include: { ...generateUserDataObject() } } } },
					Message: {
						orderBy: { createdAt: "desc" },
						take: 50,
						include: {
							user: { select: { id: true, officialName: true, officialSurname: true, displayName: true } },
							MessageReaction: { include: { user: { select: { id: true, officialName: true, officialSurname: true, displayName: true } } } },
							replyTo: {
								include: {
									user: { select: { id: true, officialName: true, officialSurname: true, displayName: true } },
								},
							},
						},
					},
				},
			});
		}
	}

	selectedGroup = {
		...selectedGroup,
		GroupMember: selectedGroup?.GroupMember.map((gm) => ({
			...gm,
			user: generateUserData(gm.user),
		})),
	};

	if (!selectedGroup && !groupId.includes("@")) {
		selectedGroup = await prisma.group
			.findFirstOrThrow({
				where: {
					id: groupId,
					GroupMember: { some: { userId: authSession.user.id } },
				},
				include: {
					Message: {
						orderBy: { createdAt: "desc" },
						take: 50,
						include: {
							user: { select: { id: true, officialName: true, officialSurname: true, displayName: true } },
							MessageReaction: { include: { user: { select: { id: true, officialName: true, officialSurname: true, displayName: true } } } },
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
	}

	return <ChatLayout authSession={authSession} group={selectedGroup} />;
}
