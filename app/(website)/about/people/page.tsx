import prisma from "@/prisma/client";
import { Suspense } from "react";
import { Topbar } from "../../server-components";
import { ExpandableCards } from "./_components/client/expandable-cards";
import { getOrdinal } from "@/lib/get-ordinal";
import { unstable_cacheLife as cacheLife } from "next/cache";
import { arrayFromNumber } from "@/lib/array-from-number";
import { romanize } from "@/lib/romanize";

function PlaceholderSection() {
	return (
		<ul className="max-w-7xl mx-auto px-5 w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4 items-start gap-4">
			{arrayFromNumber(4).map((_, index) => (
				<div key={index} className="p-4 flex flex-col hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer">
					<div className="flex gap-4 flex-col  w-full">
						<div>
							<div className="w-full aspect-square animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"></div>
						</div>
						<div className="flex justify-center items-center gap-1 flex-col">
							<div className="w-32 h-6 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
							<div className="w-24 h-6 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
						</div>
					</div>
				</div>
			))}
		</ul>
	);
}

// Fetch Functions
async function getShownSession() {
	"use cache";
	cacheLife("minutes");
	return await prisma.session.findFirst({ where: { isMainShown: true } });
}

async function fetchSecretariatMembers() {
	"use cache";
	cacheLife("minutes");
	return await prisma.user.findMany({
		where: {
			OR: [
				{ secretaryGeneral: { some: { session: { isMainShown: true } } } },
				{ deputySecretaryGeneral: { some: { session: { isMainShown: true } } } },
				{ presidentOfTheGeneralAssembly: { some: { session: { isMainShown: true } } } },
				{ deputyPresidentOfTheGeneralAssembly: { some: { session: { isMainShown: true } } } },
			],
		},
		include: {
			secretaryGeneral: { where: { session: { isMainShown: true } } },
			deputySecretaryGeneral: { where: { session: { isMainShown: true } } },
			presidentOfTheGeneralAssembly: { where: { session: { isMainShown: true } } },
			deputyPresidentOfTheGeneralAssembly: { where: { session: { isMainShown: true } } },
		},
		omit: { signature: true },
		orderBy: { officialName: "asc" },
	});
}

async function fetchChairs() {
	"use cache";
	cacheLife("minutes");
	return await prisma.user.findMany({
		where: { chair: { some: { committee: { session: { isMainShown: true } } } } },
		select: {
			officialName: true,
			officialSurname: true,
			displayName: true,
			id: true,
			profilePicture: true,
			bio: true,
			username: true,
			chair: { select: { committee: { select: { name: true } } } },
		},
		orderBy: { officialName: "asc" },
	});
}

async function fetchManagers() {
	"use cache";
	cacheLife("minutes");
	return await prisma.user.findMany({
		where: { manager: { some: { department: { session: { isMainShown: true } } } } },
		select: {
			officialName: true,
			officialSurname: true,
			displayName: true,
			id: true,
			profilePicture: true,
			bio: true,
			username: true,
			manager: { select: { department: { select: { name: true } } } },
		},
		orderBy: { officialName: "asc" },
	});
}

async function fetchMembers() {
	"use cache";
	cacheLife("minutes");
	return await prisma.user.findMany({
		where: { member: { some: { department: { session: { isMainShown: true } } } } },
		select: {
			officialName: true,
			officialSurname: true,
			displayName: true,
			id: true,
			profilePicture: true,
			bio: true,
			username: true,
			member: { select: { department: { select: { name: true } } } },
		},
		orderBy: { officialName: "asc" },
	});
}

async function fetchBoardMembers() {
	"use cache";
	cacheLife("minutes");
	return await prisma.user.findMany({
		where: { OR: [{ seniorDirector: { some: {} } }, { Director: { some: {} } }] },
		include: { seniorDirector: true, Director: true },
		omit: { signature: true },
		orderBy: { officialName: "asc" },
	});
}

// SecretariatCards Component
async function SecretariatCards() {
	"use cache";
	cacheLife("minutes");
	const secretariatMembers = await fetchSecretariatMembers();

	const processedSecretariatMembers = secretariatMembers
		.map((user) => ({
			description: !!user.secretaryGeneral.length
				? "Secretary-General"
				: !!user.deputySecretaryGeneral.length
					? "Deputy Secretary-General"
					: !!user.presidentOfTheGeneralAssembly.length
						? "President of the General Assembly"
						: "Deputy President of the General Assembly",
			title: user.displayName || `${user.officialName} ${user.officialSurname}`,
			src: user.profilePicture ? `/api/users/${user.id}/avatar?quality=100&size=1000` : "/placeholders/pfp.jpg",
			ctaText: "View Profile",
			ctaLink: `/medibook/users/${user.username || user.id}`,
			content: user.bio,
		}))
		.sort(
			(a, b) =>
				(a.description === "Secretary-General" ? -1 : 1) - (b.description === "Secretary-General" ? -1 : 1) ||
				(a.description === "President of the General Assembly" ? -1 : 1) - (b.description === "President of the General Assembly" ? -1 : 1) ||
				(a.description === "Deputy Secretary-General" ? -1 : 1) - (b.description === "Deputy Secretary-General" ? -1 : 1) ||
				(a.description === "Deputy President of the General Assembly" ? -1 : 1) - (b.description === "Deputy President of the General Assembly" ? -1 : 1)
		);

	if (!!processedSecretariatMembers.length) return <ExpandableCards people={processedSecretariatMembers} />;
	return null;
}

// ChairsCards Component
async function ChairsCards() {
	"use cache";
	cacheLife("minutes");
	const chairsOfSession = await fetchChairs();

	const processedChairsOfSession = chairsOfSession
		.map((user) => ({
			description: `Chair of ${user.chair[0].committee.name}`,
			title: user.displayName || `${user.officialName} ${user.officialSurname}`,
			src: user.profilePicture ? `/api/users/${user.id}/avatar?quality=65&size=1000` : "/placeholders/pfp.jpg",
			ctaText: "View Profile",
			ctaLink: `/medibook/users/${user.username || user.id}`,
			content: user.bio,
		}))
		.sort((a, b) => a.description.localeCompare(b.description));

	if (!!processedChairsOfSession.length) return <ExpandableCards people={processedChairsOfSession} />;
	return null;
}

// ManagersCards Component
async function ManagersCards() {
	"use cache";
	cacheLife("minutes");
	const managersOfSession = await fetchManagers();

	const processedManagersOfSession = managersOfSession
		.map((user) => ({
			description: `Manager of ${user.manager[0].department.name}`,
			title: user.displayName || `${user.officialName} ${user.officialSurname}`,
			src: user.profilePicture ? `/api/users/${user.id}/avatar?quality=65&size=1000` : "/placeholders/pfp.jpg",
			ctaText: "View Profile",
			ctaLink: `/medibook/users/${user.username || user.id}`,
			content: user.bio,
		}))
		.sort((a, b) => a.description.localeCompare(b.description));

	if (!!processedManagersOfSession.length) return <ExpandableCards people={processedManagersOfSession} />;
	return null;
}

// MemberCards Component
async function MemberCards() {
	"use cache";
	cacheLife("minutes");
	const managersOfSession = await fetchMembers();

	const processedmembersOfSession = managersOfSession
		.map((user) => ({
			description: `Member of ${user.member[0].department.name}`,
			title: user.displayName || `${user.officialName} ${user.officialSurname}`,
			src: user.profilePicture ? `/api/users/${user.id}/avatar?quality=65&size=1000` : "/placeholders/pfp.jpg",
			ctaText: "View Profile",
			ctaLink: `/medibook/users/${user.username || user.id}`,
			content: user.bio,
		}))
		.sort((a, b) => a.description.localeCompare(b.description));

	if (!!processedmembersOfSession.length) return <ExpandableCards people={processedmembersOfSession} />;
	return null;
}

// BoardCards Component
async function BoardCards() {
	"use cache";
	cacheLife("minutes");
	const boardMembers = await fetchBoardMembers();

	const processedBoardMembers = boardMembers.map((user) => ({
		description: !!user.seniorDirector.length ? "Senior Director" : "Director",
		title: user.displayName || `${user.officialName} ${user.officialSurname}`,
		src: user.profilePicture ? `/api/users/${user.id}/avatar?quality=100&size=1000` : "/placeholders/pfp.jpg",
		ctaText: "View Profile",
		ctaLink: `/medibook/users/${user.username || user.id}`,
		content: user.bio,
	}));

	if (!!processedBoardMembers.length) return <ExpandableCards people={processedBoardMembers} />;
	return null;
}

async function DynamicTitle({ title }) {
	"use cache";
	cacheLife("minutes");

	const shownSession = await getShownSession();
	if (!shownSession) return null;

	return (
		<div className="max-w-7xl mx-auto px-8 mt-8 mb-1">
			<h2 className="font-[Gilroy] text-xl text-white">
				The {title} of Session {romanize(shownSession?.numberInteger)}
			</h2>
		</div>
	);
}

// AboutPeople Component
export default async function AboutPeople() {
	"use cache";
	cacheLife("hours");

	return (
		<section className="dark font-[Gilroy]">
			<Topbar title="The Minds Behind the Conference" description="Get to know the dedicated individuals driving our mission. From visionaries to organizers, they bring ideas to life and ensure every detail is perfect." />
			<Suspense>
				<DynamicTitle title="Secretariat" />
			</Suspense>
			<Suspense fallback={<PlaceholderSection />}>
				<SecretariatCards />
			</Suspense>
			<Suspense>
				<DynamicTitle title="Chairs" />
			</Suspense>
			<Suspense fallback={<PlaceholderSection />}>
				<ChairsCards />
			</Suspense>
			<Suspense>
				<DynamicTitle title="Managers" />
			</Suspense>
			<Suspense fallback={<PlaceholderSection />}>
				<ManagersCards />
			</Suspense>
			<Suspense>
				<DynamicTitle title="Members" />
			</Suspense>
			<Suspense fallback={<PlaceholderSection />}>
				<MemberCards />
			</Suspense>
			<div className="max-w-7xl mx-auto px-8 mt-8 mb-1">
				<h2 className="font-[Gilroy] text-xl text-white">The Board of Management</h2>
			</div>
			<Suspense fallback={<PlaceholderSection />}>
				<BoardCards />
			</Suspense>
		</section>
	);
}
