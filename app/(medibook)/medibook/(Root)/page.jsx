import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Activity, CreditCard, DollarSign, Users, CalendarClock, BookOpenCheck } from "lucide-react";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import prisma from "@/prisma/client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TitleBar } from "@/components/medibook/TitleBar";

function error(e) {
	if (process.env.NODE_ENV == "development") console.log(e);
}

export default async function Page() {
	const session = await getServerSession(authOptions);
	if (!session || session.isDisabled) redirect("/medibook/signout");
	const uid = session.user.userNumber.replace(/(.{4})/g, "$1-").slice(0, -1);

	const timeGreeting = () => {
		const date = new Date();
		const hours = date.getHours();
		return hours < 12 ? "Good Morning" : hours < 18 ? "Good Afternoon" : "Good Evening";
	};
	const greeting = timeGreeting() + ", " + (session.user.displayName || session.user.officialName);

	const isAlumni = session.pastRoleNames.length > 0 ? { some: {} } : { some: {} };
	const announcements = await prisma.announcement
		.findMany({
			where: {
				isPinned: true,
			},
			orderBy: { time: "desc" },
			include: {
				MediBookAnnouncement: { select: { id: true } },
				user: { select: { officialName: true, displayName: true, officialSurname: true } },
			},
			take: 9,
		})
		.catch((e) => error(e));
	return (
		<>
			<TitleBar titleStyle="!normal-case" title={greeting + " 👋"} bgColor="bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600" />
			<div className="-none mx-auto max-w-[1200px] p-5">
				<h1 className="font-md ml-4 mt-5 text-xl font-bold tracking-tight">Today's Briefing</h1>
				<div className="mt-2 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Days Until Conference</CardTitle>
							<CalendarClock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">99999</div>
							<p className="text-xs text-muted-foreground">999 Days Until Workshop</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Awaiting Tasks</CardTitle>
							<BookOpenCheck className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">+2350</div>
							<p className="text-xs text-muted-foreground">+180.1% from last month</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Sales</CardTitle>
							<CreditCard className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">+12,234</div>
							<p className="text-xs text-muted-foreground">+19% from last month</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Active Now</CardTitle>
							<Activity className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">+573</div>
							<p className="text-xs text-muted-foreground">+201 since last hour</p>
						</CardContent>
					</Card>
				</div>
				<h2 className="font-md ml-4 mt-6 text-xl font-bold tracking-tight">{announcements.length > 0 ? "Latest Pinned Announcements" : "No Recent Pinned Announcements"}</h2>
				{announcements && (
					<ul className="mb-7 mt-2 grid gap-4 md:grid-cols-2">
						{announcements
							.filter((announcement) => announcement.isPinned)
							.map((announcement) => {
								return (
									<li className="list-none" key={announcement.id}>
										<Link href={`/medibook/announcements/${announcement.id}`}>
											<Card className="duration-300 hover:shadow-md">
												<CardHeader>
													<CardTitle className="truncate">{announcement.title}</CardTitle>
													<CardDescription className="truncate">{announcement.description}</CardDescription>
												</CardHeader>
											</Card>
										</Link>
									</li>
								);
							})}
					</ul>
				)}
			</div>
		</>
	);
}
