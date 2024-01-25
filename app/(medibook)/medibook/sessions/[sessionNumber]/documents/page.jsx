import prisma from "@/prisma/client";
import { notFound } from "next/navigation";

export default async function Page({ params }) {
	await prisma.session
		.findFirstOrThrow({
			where: { number: params.sessionNumber },
		})
		.catch(() => notFound());
	return <>Hello</>;
}
