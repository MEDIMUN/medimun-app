import prisma from "@/prisma/client";
import { TitleBar, e as s } from "@/components/medibook/TitleBar";
import { getOrdinal } from "@/lib/get-ordinal";
import { notFound } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page({ params }) {
	const committee = await getData(params);
	if (!committee) return notFound();
	return (
		<>
			<div className="mx-auto grid w-full max-w-[1200px] gap-2 p-4 md:flex-row">
				<p>{committee.description}</p>
			</div>
		</>
	);
}

async function getData(params) {
	let committee;
	try {
		committee = await prisma.committee.findFirst({
			where: {
				OR: [{ slug: params.committeeId }, { id: params.committeeId }],
				session: {
					number: params.sessionNumber,
				},
			},
			include: {
				session: {
					select: {
						number: true,
					},
				},
			},
		});
	} catch (e) {}
	if (!committee) notFound();
	return committee;
}
