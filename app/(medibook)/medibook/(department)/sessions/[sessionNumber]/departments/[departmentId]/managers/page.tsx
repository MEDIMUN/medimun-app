import { UserTooltip } from "@/app/(medibook)/medibook/client-components";
import { Button } from "@/components/button";
import { MainWrapper } from "@/components/main-wrapper";
import { TopBar } from "@/components/top-bar";
import prisma from "@/prisma/client";
import { CircleUserRound, MessageCircleMore } from "lucide-react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

async function ChairsTable(props) {
	await connection();
	const params = await props.params;
	const departmentId = await params?.departmentId;
	const sessionNumber = await params?.sessionNumber;
	console.log(departmentId, sessionNumber);
	if (!departmentId || !sessionNumber) notFound();

	const selectedCommittee = await prisma.department
		.findFirstOrThrow({
			where: {
				OR: [
					{ id: departmentId, session: { number: sessionNumber } },
					{ slug: departmentId, session: { number: sessionNumber } },
				],
			},
			select: {
				name: true,
				slug: true,
				id: true,
				manager: {
					include: {
						user: {
							select: {
								displayName: true,
								officialName: true,
								officialSurname: true,
								profilePicture: true,
								bio: true,
								id: true,
								username: true,
								Student: {
									select: {
										name: true,
									},
								},
							},
						},
					},
				},
			},
		})
		.catch(notFound);

	const sortedChairs = selectedCommittee.manager.sort((a, b) => (a.user.Student?.name === "The English School" ? -1 : 1));

	return (
		<>
			<TopBar buttonText={selectedCommittee.name} buttonHref={`/medibook/sessions/${sessionNumber}/committees/${selectedCommittee.slug || selectedCommittee.id}`} hideBackdrop hideSearchBar title="Meet the Chairs" />
			<MainWrapper>
				<ul role="list" className="-mt-12 space-y-12 divide-y divide-gray-200 xl:col-span-3">
					{sortedChairs.map((chair) => {
						const fullName = chair.user.displayName || `${chair.user.officialName} ${chair.user.officialSurname}`;
						return (
							<li key={chair.id} className="flex flex-col gap-10 pt-12 sm:flex-row">
								<UserTooltip userId={chair.userId}>
									<img
										alt="Profile picture of the chair"
										src={chair.user.profilePicture ? `/api/users/${chair.user.id}/avatar` : "/placeholders/pfp.jpg"}
										className="aspect-square md:w-64 w-full flex-none rounded-2xl object-cover"
									/>
								</UserTooltip>
								<div className="max-w-xl flex flex-col flex-auto gap-4">
									<div>
										<h3 className="text-lg/8 font-semibold tracking-tight text-gray-900">{fullName}</h3>
										<p className="text-base/7 text-gray-600">{chair.user.Student?.name}</p>
									</div>
									{chair.user.bio && <p className="text-base/7 -mt-1 text-gray-600">{chair.user.bio}</p>}
									<ul role="list" className="flex gap-x-3">
										<li>
											<Button href={`/medibook/messenger/@${chair.user.username || chair.user.id}?new=true`}>
												<MessageCircleMore />
												Message
											</Button>
										</li>
										<li>
											<Button href={`/medibook/users/${chair.user.username || chair.user.id}`}>
												<CircleUserRound />
												Profile
											</Button>
										</li>
									</ul>
								</div>
							</li>
						);
					})}
				</ul>
			</MainWrapper>
		</>
	);
}

export default function MeetTheChairsPage(props) {
	return (
		<Suspense fallback={<TopBar hideBackdrop hideSearchBar title="Meet the Chairs" />}>
			<ChairsTable {...props} />
		</Suspense>
	);
}
