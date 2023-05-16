import { Button } from "@/components/ui/button";
import Link from "next/link";
import prisma from "@/prisma/client";
import { Suspense } from "react";

export default async function RegisterButton() {
	let latestSession;
	try {
		latestSession = await prisma.session.findFirst({
			where: {
				isCurrent: true,
			},
			select: {
				number: true,
			},
		});
	} catch (e) {
		return;
	}
	return (
		<Suspense fallback={<></>}>
			<Link
				className="flex justify-center align-left h-[20px]"
				href={`/sessions/${latestSession.number}`}>
				<Button className="m-0">About Session {latestSession.number}</Button>
			</Link>
		</Suspense>
	);
}
