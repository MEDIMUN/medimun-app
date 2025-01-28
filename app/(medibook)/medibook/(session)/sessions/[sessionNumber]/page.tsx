import prisma from "@/prisma/client";
import { getOrdinal } from "@/lib/get-ordinal";
import { notFound } from "next/navigation";
import { Button } from "@/components/button";
import { romanize } from "@/lib/romanize";
import { authorize, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { TopBar } from "@/app/(medibook)/medibook/client-components";
import { Text } from "@/components/text";
import { Divider } from "@/components/divider";
import { ActionList } from "@/app/components/actions-list";

export async function generateMetadata(props: { params: Promise<{ sessionNumber: string }> }) {
	const params = await props.params;
	const sessionNumber = params.sessionNumber;
	const ordinal = getOrdinal(parseInt(params.sessionNumber));
	return {
		title: `${sessionNumber + ordinal} Annual Session - MediBook`,
		description: `${sessionNumber + ordinal} Annual Session of the Mediterranean Model United Nations`,
	};
}

export default async function Page(props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const authSession = await auth();
	const actions = [
		{
			title: "Session Announcements",
			description: "View all the announcements from the session",
			href: `/medibook/sessions/${params.sessionNumber}/announcements`,
		},
		{
			title: "Session Resources",
			description: "View all the resources from the session",
			href: `/medibook/sessions/${params.sessionNumber}/resources`,
		},
		{
			title: "Session Programme",
			description: "View the programme of the session",
			href: `/medibook/sessions/${params.sessionNumber}/programme`,
		},
		{
			title: "Session Committees",
			description: "View the committees of the session",
			href: `/medibook/sessions/${params.sessionNumber}/committees`,
		},
		authorize(authSession, [s.management])
			? {
					title: "Session Settings",
					description: "Edit the settings of the session",
					href: `/medibook/sessions/${params.sessionNumber}/settings`,
				}
			: null,
	].filter((x) => x);

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
			secretaryGeneral: { select: { user: { select: { officialName: true, officialSurname: true, displayName: true, username: true, id: true } } } },
			Day: { include: { location: true }, orderBy: { date: "asc" } },
			deputySecretaryGeneral: {
				select: { user: { select: { officialName: true, officialSurname: true, displayName: true, username: true, id: true } } },
			},
			presidentOfTheGeneralAssembly: {
				select: { user: { select: { officialName: true, officialSurname: true, displayName: true, username: true, id: true } } },
			},
			deputyPresidentOfTheGeneralAssembly: {
				select: { user: { select: { officialName: true, officialSurname: true, displayName: true, username: true, id: true } } },
			},
			committee: { select: { _count: { select: { delegate: true } } } },
			department: { select: { _count: { select: { member: true } } } },
			_count: { select: { committee: true } },
		},
	});

	[numberOfNationalities, numberOfSchools, selectedSession] = await Promise.all([numberOfNationalities, numberOfSchools, selectedSession]);

	const numberOfDelegates = selectedSession?.committee?.reduce((acc, curr) => acc + curr._count.delegate, 0);
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

	const secretaryGeneralArray = selectedSession.secretaryGeneral.map(({ user }) => {
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

	const allSecretariatMembers = [...deputySecretaryGeneral, ...presidentOfTheGeneralAssembly, ...deputyPresidentOfTheGeneralAssembly];

	const conferenceDays = selectedSession?.Day?.filter((day) => day.type === "CONFERENCE");
	const workshopDays = selectedSession?.Day?.filter((day) => day.type === "WORKSHOP");

	const secretaryGeneral = selectedSession?.secretaryGeneral[0]?.user;

	return (
		<>
			<TopBar
				hideBackdrop
				hideSearchBar
				buttonHref="/medibook/sessions"
				buttonText="Sessions"
				title={
					selectedSession.theme ? (
						<>Annual Session {romanize(selectedSession.numberInteger)}</>
					) : (
						`The ${selectedSession.number + getOrdinal(selectedSession.numberInteger)} Annual Session`
					)
				}>
				{authorize(authSession, [s.management]) && <Button href={`/medibook/sessions/${selectedSession.number}/settings`}>Edit Session</Button>}
			</TopBar>
			<div className="flex h-[200px] w-full overflow-hidden rounded-xl bg-[url(/assets/medibook-session-welcome.webp)] bg-cover bg-right ring-1 ring-gray-200 md:h-[328px]">
				<div className="mt-auto p-5">
					<p className="mb-1 font-[canela] text-2xl text-primary md:text-4xl">{selectedSession.theme}</p>
					<p className="font-[canela] text-xl text-zinc-700 dark:text-zinc-300 md:text-2xl">{selectedSession.subTheme}</p>
				</div>
			</div>
			{secretaryGeneral && selectedSession.welcomeText && (
				<div className="rounded-xl bg-zinc-100/20 p-4 ring-1 ring-gray-200">
					<Text>{selectedSession.welcomeText}</Text>
					<Divider className="invisible my-2" />
					<p className="my-auto font-[JackyBlack] text-sm">
						<span className="text-primary">
							{secretaryGeneral.displayName || `${secretaryGeneral.officialName} ${secretaryGeneral.officialSurname}`}
						</span>
						, Secretary-General
					</p>
				</div>
			)}
			{selectedSession.isVisible && (
				<dl className="grid grid-cols-2 gap-0.5 divide-gray-200 overflow-hidden rounded-2xl text-center ring-1 ring-gray-200 sm:grid-cols-2 lg:grid-cols-4">
					{statsArray.map((stat, index) => (
						<div key={index + Math.random()} className="flex flex-col bg-gray-200/5 p-8">
							<dt className="text-sm font-semibold leading-6 text-gray-600">{stat.title}</dt>
							<dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">{stat.data}</dd>
						</div>
					))}
				</dl>
			)}
			<ActionList actions={actions} />
		</>
	);
}
