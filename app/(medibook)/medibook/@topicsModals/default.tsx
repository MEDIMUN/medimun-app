import prisma from "@/prisma/client";
import { CreateTopicModal, DeleteTopicModal, EditTopicModal } from "./modals";

export default async function TopicModals({ searchParams }) {
	let selectedTopic, selectedCommittee;

	if (searchParams?.["edit-topic"])
		selectedTopic = await prisma.topic.findUnique({ where: { id: searchParams?.["edit-topic"] }, include: { committee: true } });
	if (searchParams?.["delete-topic"])
		selectedTopic = await prisma.topic.findUnique({ where: { id: searchParams?.["delete-topic"] }, include: { committee: true } });
	if (searchParams?.["create-topic"]) selectedCommittee = await prisma.committee.findUnique({ where: { id: searchParams?.["create-topic"] } });

	return (
		<>
			<DeleteTopicModal selectedTopic={selectedTopic} />
			<EditTopicModal selectedTopic={selectedTopic} />
			<CreateTopicModal selectedCommittee={selectedCommittee} />
		</>
	);
}
