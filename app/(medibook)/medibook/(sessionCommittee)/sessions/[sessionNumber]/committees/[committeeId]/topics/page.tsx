import prisma from "@/prisma/client";
import { EditTopicsModal } from "./modals";
import { notFound } from "next/navigation";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import Icon from "@/components/icon";

export default async function Page({ params }) {
	const committee = await getData(params);
	const topics = [
		{ name: committee.topic1, description: committee.topic1description },
		{ name: committee.topic2, description: committee.topic2description },
		{ name: committee.topic3, description: committee.topic3description },
	];

	return (
		<>
			<EditTopicsModal committee={committee} params={params} />
			<div className="mx-auto grid w-full gap-2 p-4 md:flex-row">
				{topics.map((topic, index) => (
					<li
						key={index}
						className="flex w-full flex-col gap-2 rounded-xl border border-black/10 bg-content1/60 p-4 dark:border-white/20 md:flex-row">
						<div className="flex">
							<div className="flex flex-col gap-1">
								<div className="flex gap-2">
									<p className="mb-[-10px] bg-gradient-to-br from-foreground-800 to-foreground-500 bg-clip-text text-xl font-semibold tracking-tight text-transparent dark:to-foreground-200">
										{topic.name}
									</p>
								</div>
								<p className="mt-1 text-default-400">{topic.description}</p>
							</div>
						</div>
						<div className="my-auto ml-auto flex gap-2">
							<Button
								as={Link}
								href={`/`}
								isIconOnly
								endContent={<Icon className="" icon="solar:user-outline" width={22} />}
								fullWidth
								className="w-auto border-small border-black/10 bg-black/10 shadow-md light:text-black dark:border-white/20 dark:bg-white/10"></Button>
							{/* 							<EditButton id={user.id} />
							 */}
						</div>
					</li>
				))}
			</div>
		</>
	);
}

async function getData(params) {
	let committee: any;
	try {
		committee = await prisma.committee.findFirstOrThrow({
			where: {
				OR: [{ slug: params.committeeId }, { id: params.committeeId }],
				session: {
					number: params.sessionNumber,
				},
			},
			include: {
				session: {
					select: {
						number: true,
					},
				},
			},
		});
	} catch {
		return notFound();
	}
	return committee;
}
