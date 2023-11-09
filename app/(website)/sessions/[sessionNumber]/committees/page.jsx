import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { TitleBar, e as s } from "@/components/medibook/TitleBar";
import { capitaliseEachWord } from "@/lib/capitaliseEachWord";

export const revalidate = 60;

async function getData(params) {
	return await prisma.committee
		.findMany({
			where: { session: { number: params.sessionNumber } },
			orderBy: [{ type: "asc" }, { name: "asc" }],
		})
		.catch(() => notFound());
}

const committeeTypes = {
	GENERALASSEMBLY: { name: "GENERAL ASSEMBLY", imageUrl: "/pages/index/section3images/4.jpeg" },
	SECURITYCOUNCIL: { name: "SECURITY COUNCIL", imageUrl: "/pages/index/section3images/3.jpeg" },
	SPECIALCOMMITTEE: { name: "SPECIAL COMMITTEE", imageUrl: "/pages/index/section3images/2.jpeg" },
};

export default async function Page({ params }) {
	const committees = await getData(params);
	return (
		<>
			<TitleBar title="Committees" button1roles={[s.admins, s.sec]} button1href={`/medibook/sessions/${params.sessionNumber}/committees?add`} button1text="Add Committee" />
			<ul className="mx-auto grid max-w-[1248px] gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
				{committees.length == 0 && <p>No committees found in selected session...</p>}
				{committees.map((committee) => {
					return (
						<li key={committee.id}>
							<Link href={`/medibook/sessions/${params.sessionNumber}/committees/${committee.slug || committee.id}`}>
								<Card
									className={`h-[212px] overflow-hidden border-0 bg-cover bg-center text-white shadow-2xl shadow-slate-900 duration-300 md:hover:shadow-md`}
									style={{ backgroundImage: `url(${committeeTypes[committee.type].imageUrl})` }}>
									<div style={{ background: "radial-gradient(ellipse at bottom right, #AE2D2860 0%, #111 85%, #111 100%)" }} className="h-full w-full bg-black">
										<CardHeader>
											<p className="text-sm text-slate-300">{committeeTypes[committee.type].name}</p>
											<CardTitle>{capitaliseEachWord(committee.name)}</CardTitle>
											<div className="pt-12">
												{committee.topic1 && <CardDescription className="truncate text-slate-400">{committee.topic1}</CardDescription>}
												{committee.topic2 && <CardDescription className="truncate text-slate-400">{committee.topic2}</CardDescription>}
												{committee.topic3 && <CardDescription className="truncate text-slate-400">{committee.topic3}</CardDescription>}
											</div>
										</CardHeader>
									</div>
								</Card>
							</Link>
						</li>
					);
				})}
			</ul>
		</>
	);
}
