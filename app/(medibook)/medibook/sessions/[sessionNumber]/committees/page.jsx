import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Drawer from "./Drawer";
import { TitleBar, e as s } from "@/components/medibook/TitleBar";
import { Badge } from "@/components/ui/badge";

function capitaliseEachWord(string) {
	return string.replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
}
async function getData(params) {
	let committees;
	try {
		committees = await prisma.committee.findMany({
			where: {
				session: {
					number: params.sessionNumber,
				},
			},
			orderBy: [{ type: "asc" }, { name: "asc" }],
		});
	} catch (e) {
		notFound();
	}
	return committees;
}

export default async function Page({ params }) {
	const committees = await getData(params);
	const session = await getServerSession(authOptions);
	if (!session || session.isDisabled) return notFound();

	if (committees.length == 0) {
		return (
			<>
				<Drawer props={params} />
				<TitleBar
					bgColor="bg-fixed bg-bottom bg-cover bg-[url(/pages/index/section3images/5.jpeg)]"
					title="Committees"
					button1roles={[s.admins, s.sec]}
					button1href={`/medibook/sessions/${params.sessionNumber}/committees?add`}
					button1text="Add Committee"
				/>{" "}
				<div className="mx-auto mt-5 flex max-w-[1200px] justify-center gap-[24px] p-5">
					<div>No committees found in selected sessions...</div>
				</div>
			</>
		);
	}
	return (
		<>
			<Drawer props={params} />
			<TitleBar
				bgColor="bg-fixed bg-bottom bg-cover bg-[url(/pages/index/section3images/5.jpeg)]"
				title="Committees"
				button1roles={[s.admins, s.sec]}
				button1href={`/medibook/sessions/${params.sessionNumber}/committees?add`}
				button1text="Add Committee"
			/>
			<div className="mx-auto max-w-[1200px] gap-[24px] p-5">
				<ul>
					{committees.map((committee) => {
						return (
							<li className="my-2 list-none" key={committee.id}>
								<Link href={`/medibook/sessions/${params.sessionNumber}/committees/${committee.slug || committee.id}`}>
									<Card
										className={`border-l-2 duration-300 hover:border-l-8 hover:shadow-md md:hover:border-l-[15px] ${committee.type == "GENERALASSEMBLY" && "border-l-red-400"} ${
											committee.type == "SPECIALCOMMITTEE" && "border-l-blue-400"
										} ${committee.type == "SECURITYCOUNCIL" && "border-l-green-400"}`}>
										<CardHeader>
											<p className="text-sm text-gray-500">
												{committee.type === "GENERALASSEMBLY" ? "GENERAL ASSEMBLY" : committee.type === "SECURITYCOUNCIL" ? "SECURITY COUNCIL" : "SPECIAL COMMITTEE"}
											</p>

											<CardTitle>{capitaliseEachWord(committee.name)}</CardTitle>
											{(committee.topic1 || committee.topic2 || committee.topic3) && <CardDescription className="uppercase text-black">Topics</CardDescription>}
											{committee.topic1 && <CardDescription>{committee.topic1}</CardDescription>}
											{committee.topic2 && <CardDescription>{committee.topic2}</CardDescription>}
											{committee.topic3 && <CardDescription>{committee.topic3}</CardDescription>}
										</CardHeader>
									</Card>
								</Link>
							</li>
						);
					})}
				</ul>
			</div>
		</>
	);
}
