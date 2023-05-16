import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users, CalendarClock, BookOpenCheck } from "lucide-react";

export default async function Page() {
	const session = await getServerSession(authOptions);
	const uid = session.user.userNumber.replace(/(.{4})/g, "$1-").slice(0, -1);

	const timeGreeting = () => {
		const date = new Date();
		const hours = date.getHours();
		return hours < 12 ? "Good Morning" : hours < 18 ? "Good Afternoon" : "Good Evening";
	};
	const greeting = timeGreeting() + ", " + (session.user.displayName || session.user.officialName);
	return (
		<div className="p-5 max-w-[1200px] mx-auto -none">
			<div className="pl-2">
				<h2 className="font-md text-3xl font-bold tracking-tight">{greeting + " 👋"}</h2>
				<h3 className="text-sm pl-0.5">
					<span className="select-text">{session.currentRoleNames[0] + ", " ?? ""}</span>
					<span className="font-thin">UserID </span>
					<span className="select-text font-regular pr-2">{uid}</span>
				</h3>
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-5">
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
			<div>
				<div className="pl-2 mt-5">
					<h2 className="font-md text-xl font-bold tracking-tight">Latest Announcements</h2>
				</div>
			</div>
		</div>
	);
}
