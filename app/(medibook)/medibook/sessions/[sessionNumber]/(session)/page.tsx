import prisma from "@/prisma/client";
import { getOrdinal } from "@/lib/ordinal";
import Drawer from "./Drawer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@nextui-org/avatar";
import DepartmentDrawer from "./DepartmentDrawer";
import TeamMemberCard from "@/nextuipro/team-member-card";
import { StatsCard } from "./StatsCard";

import Icon from "@/components/icon";
import { TopBar } from "../../../client-components";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { romanize } from "@/lib/romanize";

export async function generateMetadata({ params }) {
	const sessionNumber = params.sessionNumber;
	const ordinal = getOrdinal(params.sessionNumber);
	return {
		title: `${sessionNumber + ordinal} Annual Session - MediBook`,
		description: `${sessionNumber + ordinal} Annual Session of the Mediterranean Model United Nations`,
	};
}

export const revalidate = 60;

export default async function Page({ params, searchParams }) {
	let numberOfNationalities = prisma.user
		.groupBy({
			where: { delegate: { some: { committee: { session: { number: params.sessionNumber } } } } },
			by: ["nationality"],
		})
		.catch(notFound);

	let numberOfSchools = prisma.user
		.groupBy({
			where: {
				delegate: {
					some: {
						committee: {
							session: {
								number: params.sessionNumber,
							},
						},
					},
				},
			},
			by: ["schoolId"],
		})
		.catch(notFound);

	let selectedSession = prisma.session.findUnique({
		where: {
			number: params.sessionNumber,
		},
		include: {
			secretaryGeneral: {
				select: { user: { select: { officialName: true, officialSurname: true, displayName: true, username: true, id: true } } },
			},
			Day: {
				include: { location: true },
				orderBy: { date: "asc" },
			},
			deputySecretaryGeneral: {
				select: { user: { select: { officialName: true, officialSurname: true, displayName: true, username: true, id: true } } },
			},
			presidentOfTheGeneralAssembly: {
				select: { user: { select: { officialName: true, officialSurname: true, displayName: true, username: true, id: true } } },
			},
			deputyPresidentOfTheGeneralAssembly: {
				select: { user: { select: { officialName: true, officialSurname: true, displayName: true, username: true, id: true } } },
			},
			committee: {
				select: { _count: { select: { delegate: true } } },
			},
			department: {
				select: { _count: { select: { member: true } } },
			},
			_count: {
				select: { committee: true },
			},
		},
	});

	[numberOfNationalities, numberOfSchools, selectedSession] = await Promise.all([numberOfNationalities, numberOfSchools, selectedSession]);

	const numberOfDelegates = selectedSession.committee.reduce((acc, curr) => acc + curr._count.delegate, 0);
	const roundedNumberOfDelegates = Math.ceil(numberOfDelegates / 50) * 50;

	const numberOfMembers = selectedSession.department.reduce((acc, curr) => acc + curr._count.member, 0);
	const roundedNumberOfMembers = Math.ceil(numberOfMembers / 5) * 5;

	const statsArray = [
		{
			title: "Committees",
			data: selectedSession._count.committee,
		},
		{
			title: "Delegates",
			data: roundedNumberOfDelegates,
		},
		{
			title: "Days",
			data: selectedSession.Day.length,
		},
		{
			title: "Nationalities",
			data: numberOfNationalities.length,
		},
		{
			title: "Schools",
			data: numberOfSchools.length,
		},
		{
			title: "Volunteers",
			data: roundedNumberOfMembers,
		},
	];

	const secretaryGeneral = selectedSession.secretaryGeneral.map(({ user }) => {
		return {
			role: "Secretary-General",
			name: user.displayName ? user.displayName : `${user.officialName} ${user.officialSurname}`,
			username: user.username,
			id: user.id,
		};
	});

	const deputySecretaryGeneral = selectedSession.deputySecretaryGeneral.map(({ user }) => {
		return {
			role: "Deputy Secretary-General",
			name: user.displayName ? user.displayName : `${user.officialName} ${user.officialSurname}`,
			username: user.username,
			id: user.id,
		};
	});

	const presidentOfTheGeneralAssembly = selectedSession.presidentOfTheGeneralAssembly.map(({ user }) => {
		return {
			role: "President of the General Assembly",
			name: user.displayName ? user.displayName : `${user.officialName} ${user.officialSurname}`,
			username: user.username,
			id: user.id,
		};
	});

	const deputyPresidentOfTheGeneralAssembly = selectedSession.deputyPresidentOfTheGeneralAssembly.map(({ user }) => {
		return {
			role: "Deputy President of the General Assembly",
			name: user.displayName ? user.displayName : `${user.officialName} ${user.officialSurname}`,
			username: user.username,
			id: user.id,
		};
	});

	const allSecretariatMembers = [
		...secretaryGeneral,
		...deputySecretaryGeneral,
		...presidentOfTheGeneralAssembly,
		...deputyPresidentOfTheGeneralAssembly,
	];

	const conferenceDays = selectedSession?.Day?.filter((day) => day.type === "CONFERENCE");
	const workshopDays = selectedSession?.Day?.filter((day) => day.type === "WORKSHOP");

	return (
		<>
			<TopBar
				title={
					<>
						{selectedSession.theme}
						<Badge className="ml-1 -translate-y-[3px]">Session {romanize(selectedSession.numberInteger)}</Badge>
					</>
				}
				subheading="Session Overview">
				<Button>Settings</Button>
			</TopBar>
			<Drawer selectedSession={selectedSession} />
			<DepartmentDrawer props={params} />
			<div className="flex max-w-[1500px] flex-col gap-4 2xl:mx-auto">
				<div className="-mx-4 -mb-4 -mt-4 flex w-[calc(100%+32px)] flex-col gap-4 rounded-none bg-[url(/gradients/7.jpg)] bg-cover p-4 py-4 md:m-0 md:w-full md:rounded-xl lg:flex-row">
					<div className="mt-auto flex w-full flex-col">
						<h2 className="bg-gradient-to-br from-white to-neutral-300 bg-clip-text text-3xl font-semibold tracking-tight text-transparent dark:to-foreground-200 lg:inline-block">
							{selectedSession.theme || `The ${selectedSession.number + getOrdinal(selectedSession.number)} Annual Session`}
						</h2>
						{selectedSession.phrase2 && (
							<p className="font-regular bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-xl tracking-tight text-transparent dark:to-foreground-200 lg:inline-block">
								{selectedSession.phrase2}
							</p>
						)}
						<div className="mt-4 grid w-full grid-cols-2 gap-[2px] overflow-hidden rounded-lg md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6">
							{statsArray.map((card, index) => (
								<StatsCard style={{ animationDelay: `${index * 100}ms` }} title={card.title} value={card.data} key={index} />
							))}
						</div>
						{selectedSession.welcomeText && (
							<div className="mt-4 animate-appearance-in rounded-xl bg-content1/50 p-4 pt-3">
								<p className="font-[200]">{selectedSession.welcomeText}</p>
								{!!secretaryGeneral.length && (
									<div className="mt-2 flex max-w-max gap-2 rounded-lg duration-300">
										<Avatar
											className="mask mask-squircle shadow-md"
											showFallback
											src={`/api/users/${secretaryGeneral[0].id}/avatar`}
											radius="none"
											size="sm"
										/>
										<div className="my-auto">
											<p className="text-sm leading-4">{secretaryGeneral[0].name}</p>
											<p className="text-xs">Secretary-General</p>
										</div>
									</div>
								)}
							</div>
						)}
						{!!allSecretariatMembers.length && (
							<div className="mt-4 grid w-full grid-cols-1 gap-[2px] overflow-hidden rounded-xl md:grid-cols-2 lg:grid-cols-2">
								{allSecretariatMembers.map((member, index) => (
									<TeamMemberCard style={{ animationDelay: `${index * 100}ms` }} className="animate-appearance-in" key={index} member={member} />
								))}
							</div>
						)}
						{!!workshopDays.length && (
							<div className="mt-4 grid animate-appearance-in gap-[2px] overflow-hidden rounded-xl delay-150 lg:grid-cols-2">
								{workshopDays.map((day, index) => (
									<div style={{ animationDelay: `${index * 250}ms` }} key={index} className="flex flex-row gap-2 bg-content1/50 p-4">
										<p className="font-regular my-auto bg-gradient-to-br from-black to-neutral-800 bg-clip-text text-xl tracking-tight text-transparent dark:to-foreground-200 lg:inline-block">
											{day.name || `Workshop Day ${index + 1}`}
											<span className="ml-2 font-thin">({day.date.toLocaleString("uk-en").slice(0, 10)})</span>
										</p>
										<Button
											as={Link}
											endContent={<Icon icon="solar:arrow-right-outline" width={16} />}
											href={`/medibook/sessions/${selectedSession.number}/programme/workshop-day-${index + 1}`}
											radius="full"
											size="sm"
											className="ml-auto max-w-max bg-content2/60 shadow-sm">
											Programme
										</Button>
									</div>
								))}
							</div>
						)}
						{!!conferenceDays.length && (
							<div className="mt-4 grid animate-appearance-in gap-[2px] overflow-hidden rounded-xl delay-150 lg:grid-cols-2">
								{conferenceDays.map((day, index) => (
									<div style={{ animationDelay: `${index * 100}ms` }} key={index} className="flex flex-row gap-2 bg-content1/50 p-4">
										<p className="font-regular my-auto bg-gradient-to-br from-black to-neutral-800 bg-clip-text text-xl tracking-tight text-transparent dark:to-foreground-200 lg:inline-block">
											{day.name || `Conference Day ${index + 1}`}
											<span className="ml-2 font-thin">({day.date.toLocaleString("uk-en").slice(0, 10)})</span>
										</p>
										<Button
											as={Link}
											endContent={<Icon icon="solar:arrow-right-outline" width={16} />}
											href={`/medibook/sessions/${selectedSession.number}/programme/conference-day-${index + 1}`}
											radius="full"
											size="sm"
											className="ml-auto max-w-max bg-content2/60 shadow-sm">
											Programme
										</Button>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
