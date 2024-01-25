import prisma from "@/prisma/client";
import { getOrdinal } from "@lib/get-ordinal";
import Drawer from "./Drawer";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { TitleBar } from "@/components/medibook/TitleBar";
import { authorize, s } from "@/lib/authorize";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter, Button, Chip, Avatar, AvatarGroup, Divider } from "@nextui-org/react";
import { capitaliseEachWord } from "@/lib/capitaliseEachWord";
import CommitteeDrawer from "./CommitteeDrawer";
import DepartmentDrawer from "./DepartmentDrawer";
import Dropdown from "./Dropdown";
import { Tooltip } from "@nextui-org/react";
export const revalidate = 60;

export async function generateMetadata({ params }) {
	const sessionNumber = params.sessionNumber;
	const ordinal = getOrdinal(params.sessionNumber);
	return { title: `${sessionNumber + ordinal} Annual Session - MediBook`, description: `${sessionNumber + ordinal} Annual Session of the Mediterranean Model United Nations` };
}

async function getDepartments(params) {
	return await prisma.department
		.findMany({
			where: { session: { number: params.sessionNumber } },
			include: { member: { select: { user: { select: { officialName: true, officialSurname: true, id: true } } } }, manager: { select: { user: { select: { officialName: true, officialSurname: true, id: true } } } } },
			orderBy: [{ name: "asc" }],
		})
		.catch(() => notFound());
}
async function getCommittees(params) {
	return await prisma.committee
		.findMany({
			where: { session: { number: params.sessionNumber } },
			include: { chair: { select: { user: { select: { officialName: true, officialSurname: true, id: true } } } }, delegate: { select: { user: { select: { officialName: true, officialSurname: true, id: true } } } } },
			orderBy: [{ type: "asc" }, { name: "asc" }],
		})
		.catch(() => notFound());
}

async function getSessionData(params) {
	return await prisma.session.findFirstOrThrow({ where: { number: params.sessionNumber } }).catch(() => notFound());
}

const committeeTypes = {
	GENERALASSEMBLY: { name: "General Assembly", imageUrl: "/placeholders/entity-backgrounds/GAIMAGE.jpg" },
	SECURITYCOUNCIL: { name: "Security Council", imageUrl: "/placeholders/entity-backgrounds/SCIMAGE.jpg" },
	SPECIALCOMMITTEE: { name: "Special Committee", imageUrl: "/placeholders/entity-backgrounds/SPCIMAGE.jpg" },
};

const departmentTypes = {
	IT: { imageUrl: "/placeholders/entity-backgrounds/ITDEPARTMENT.jpg" },
	SALES: { imageUrl: "/placeholders/entity-backgrounds/SALESDEPARTMENT.jpg" },
	MEDINEWS: { imageUrl: "/placeholders/entity-backgrounds/NEWSDEPARTMENT.jpg" },
};

const EntityTitle = ({ children }) => {
	return <h2 className="mx-auto max-w-[1248px] px-6 text-2xl">{children}</h2>;
};

export default async function Page({ params, searchParams }) {
	let session = getServerSession(authOptions),
		selectedSession = getSessionData(params),
		committees = getCommittees(params),
		departments = getDepartments(params);
	[session, selectedSession, committees, departments] = await Promise.all([session, selectedSession, committees, departments]);

	const ordinal = getOrdinal(selectedSession.number);
	const allUserCommittees = [...session.currentRoles, ...session.pastRoles].filter((role) => role.name == s.chair || role.name == s.delegate).map((role) => role.committeeId);
	const allUserDepartments = [...session.currentRoles, ...session.pastRoles].filter((role) => role.name == s.manager || role.name == s.member).map((role) => role.departmentId);

	committees = committees.sort((a, b) => {
		const aIsIn = allUserCommittees.includes(a.id);
		const bIsIn = allUserCommittees.includes(b.id);
		if (aIsIn && !bIsIn) return -1;
		if (!aIsIn && bIsIn) return 1;
		return 0;
	});

	departments = departments.sort((a, b) => {
		const aIsIn = allUserDepartments.includes(a.id);
		const bIsIn = allUserDepartments.includes(b.id);
		if (aIsIn && !bIsIn) return -1;
		if (!aIsIn && bIsIn) return 1;
		return 0;
	});

	return (
		<>
			<Drawer selectedSession={selectedSession} />
			<CommitteeDrawer props={params} />
			<DepartmentDrawer props={params} />
			<div className="h-[256px] w-full rounded-2xl bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100 shadow-lg">
				<div className="mx-auto flex h-full max-w-[1248px] flex-col p-6 font-[montserrat]">
					<div className="flex w-full justify-between">
						<h1 className="my-auto text-xl">
							{selectedSession.number}
							<sup>{ordinal}</sup> Annual Session
						</h1>
						<Dropdown className="mt-auto" session={session} />
					</div>

					<div className="mt-auto flex w-full flex-col justify-between align-bottom md:flex-row">
						<div className="text-2xl">
							<p className="font-[500]">{selectedSession.theme}</p>
							<p className=""> {selectedSession.phrase2}</p>
						</div>
					</div>
				</div>
			</div>
			<ul className="mx-auto grid max-w-[1248px] grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
				{!!committees.length && (
					<>
						{committees.map((committee) => {
							const userIsIn = allUserCommittees.includes(committee.id);
							return (
								<Card as="li" key={committee.id} className={`h-[217px] ${userIsIn && ""}`}>
									<CardHeader className="flex gap-3">
										<Avatar name={committee.shortName} showFallback isBordered className={userIsIn ? "bg-gradient-to-r from-blue-400 to-emerald-400 text-white" : "bg-black text-white"} />
										<div className="flex flex-col">
											<p className="text-md">{capitaliseEachWord(committee.name).replace("On", "on").replace("Of", "of").replace("The", "the")}</p>
											<p className="text-small text-default-500">{!userIsIn ? committeeTypes[committee.type].name : "My Committee"}</p>
										</div>
									</CardHeader>
									<CardBody as="ol" className="pt-0">
										<li className="truncate">{committee.topic1}</li>
										<li className="truncate">{committee.topic2}</li>
										<li className="truncate">{committee.topic3}</li>
									</CardBody>
									<Divider />
									<CardFooter>
										<AvatarGroup max={4} size="sm" isBordered>
											{[...committee.chair, ...committee.delegate].map(({ user, index }) => {
												const name = user.officialName[0] + user.officialSurname[0];
												return <Avatar showFallback name={name} key={user.id} src={`/api/user/${user.id}/profilePicture`} />;
											})}
										</AvatarGroup>
										{session && authorize(session, [s.management]) && (
											<Button as={Link} href={`/medibook/sessions/${params.sessionNumber}/committees/${committee.slug || committee.id}/?edit&saveurl=/medibook/sessions/${params.sessionNumber}`} className="ml-auto mt-auto">
												Edit
											</Button>
										)}
										<Button as={Link} href={`/medibook/sessions/${params.sessionNumber}/committees/${committee.slug || committee.id}`} className="ml-2 mt-auto">
											View
										</Button>
									</CardFooter>
								</Card>
							);
						})}
					</>
				)}
				{authorize(session, [s.management, s.chair, s.schooldirector, s.manager, s.member]) &&
					departments.map((department) => {
						const userIsIn = allUserDepartments.includes(department.id);
						return (
							<Card as="li" key={department.id} className={`h-[217px] ${userIsIn && ""}`}>
								<CardHeader className="flex gap-3">
									<div className="flex flex-col">
										<p className="text-md">{capitaliseEachWord(department.name).replace("On", "on").replace("Of", "of").replace("The", "the")}</p>
										<p className="text-small text-default-500">{!userIsIn ? "Department" : "My Department"}</p>
									</div>
								</CardHeader>
								<CardBody className="pt-0">{department.description}</CardBody>
								<Divider />
								<CardFooter>
									<AvatarGroup max={4} size="sm" isBordered>
										{[...department.manager, ...department.member].map(({ user, index }) => {
											const name = user.officialName[0] + user.officialSurname[0];
											return <Avatar showFallback name={name} key={user.id} src={`/api/user/${user.id}/profilePicture`} />;
										})}
									</AvatarGroup>
									{session && authorize(session, [s.management]) && (
										<Button as={Link} href={`/medibook/sessions/${params.sessionNumber}/departments/${department.slug || department.id}/?edit`} className="ml-auto mt-auto">
											Edit
										</Button>
									)}
									<Button as={Link} href={`/medibook/sessions/${params.sessionNumber}/departments/${department.slug || department.id}`} className="ml-2 mt-auto">
										View
									</Button>
								</CardFooter>
							</Card>
						);
					})}
			</ul>
		</>
	);
}
