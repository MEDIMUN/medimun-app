import Login from "./Login";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import prisma from "@/prisma/client";

export const metadata = {
	title: "Log In",
	description: "Login to MediBook to access your account.",
};

export default async function Page() {
	const session = await getServerSession(authOptions);
	if (session) redirect("/medibook");
	const currentSession = await prisma.session
		.findFirst({
			where: {
				isCurrent: true,
			},
			select: {
				number: true,
			},
		})
		.catch(() => notFound());

	return <Login currentSession={currentSession} />;
}
