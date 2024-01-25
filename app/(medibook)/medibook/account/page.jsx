import { getServerSession } from "next-auth";
import AccountForm from "./AccountForm";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { userData } from "@/lib/user-data";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";

export default async function Page() {
	const session = await getServerSession(authOptions);
	if (!session) return notFound();
	let user = prisma.user.findUnique({ where: { id: session.user.id }, include: { student: { select: { school: true } } } }).catch(() => notFound());
	let schools = prisma.school.findMany({ orderBy: { name: "asc" }, include: { location: true } }).catch(() => notFound());
	[schools, user] = await Promise.all([schools, user]);
	return <AccountForm schools={schools} user={user} session={session} />;
}
