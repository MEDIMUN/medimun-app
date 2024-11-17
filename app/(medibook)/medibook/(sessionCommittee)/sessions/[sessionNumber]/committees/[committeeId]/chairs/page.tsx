import { TopBar, UserTooltip } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { Button } from "@/components/button";
import prisma from "@/prisma/client";
import { Avatar } from "@nextui-org/avatar";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function MeetTheChairsPage(props) {
	const authSession = await auth();
	const params = await props.params;
	const committeeId = params.committeeId;
	const sessionNumber = params.sessionNumber;

	const chairs = await prisma.chair
		.findMany({
			where: {
				committee: {
					session: {
						number: sessionNumber,
					},
					OR: [{ id: committeeId }, { slug: committeeId }],
				},
			},
			include: {
				user: {
					include: {
						Student: true,
					},
				},
				committee: true,
			},
		})
		.catch(notFound);

	const sortedChairs = chairs.sort((a, b) => (a.user.Student?.name === "The English School" ? -1 : 1));

	return (
		<>
			<TopBar
				buttonText={chairs[0].committee.name}
				buttonHref={`/medibook/sessions/${sessionNumber}/committees/${committeeId}`}
				hideBackdrop
				hideSearchBar
				title="Meet the Chairs"
			/>
			<ul role="list" className="-mt-12 space-y-12 divide-y divide-gray-200 xl:col-span-3">
				{sortedChairs.map((chair) => {
					const fullName = chair.user.displayName || `${chair.user.officialName} ${chair.user.officialSurname}`;
					return (
						<li key={chair.id} className="flex flex-col gap-10 pt-12 sm:flex-row">
							<UserTooltip userId={chair.userId}>
								<img
									alt="Profile picture of the chair"
									src={chair.user.profilePicture ? `/api/users/${chair.user.id}/avatar` : "/placeholders/pfp.jpg"}
									className="aspect-[4/5] w-52 flex-none rounded-2xl object-cover"
								/>
							</UserTooltip>
							<div className="max-w-xl flex-auto">
								<h3 className="text-lg/8 font-semibold tracking-tight text-gray-900">{fullName}</h3>
								<p className="text-base/7 text-gray-600">{chair.user.Student?.name}</p>
								<p className="mt-6 text-base/7 text-gray-600">{chair.user.bio}</p>
								<ul role="list" className=" flex gap-x-6">
									<li>
										<Button
											href={`/medibook/messenger/@${chair.user.username || chair.user.id}?new=true`}
											className="text-gray-400 hover:text-gray-500">
											Message
										</Button>
									</li>
								</ul>
							</div>
						</li>
					);
				})}
			</ul>
		</>
	);
}
