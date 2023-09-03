import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Drawer from "./Drawer";
import { TitleBar, e as s } from "@/components/medibook/TitleBar";

function capitaliseEachWord(string) {
	return string.replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
}
async function getData(params) {
	let committees;
	try {
		committees = await prisma.department.findMany({
			where: {
				session: {
					number: params.sessionNumber,
				},
			},
		});
	} catch (e) {
		notFound();
	}
	return committees;
}

export default async function Page({ params }) {
	const committees = await getData(params);
	const session = await getServerSession(authOptions);

	if (committees.length == 0) {
		return (
			<>
				<Drawer props={params} />
				<TitleBar
					bgColor="bg-fixed bg-bottom bg-cover bg-[url(/pages/index/section3images/5.jpeg)]"
					title="Departments"
					button1roles={[s.admins, s.sec]}
					button1href={`/medibook/sessions/${params.sessionNumber}/departments?add`}
					button1text="Add Department"
				/>{" "}
				<div className="mx-auto mt-5 flex max-w-[1200px] justify-center gap-[24px] p-5">
					<div>No departments found in selected sessions...</div>
				</div>
			</>
		);
	}
	return (
		<>
			<Drawer props={params} />
			<TitleBar
				bgColor="bg-fixed bg-bottom bg-cover bg-[url(/pages/index/section3images/5.jpeg)]"
				title="Departments"
				button1roles={[s.admins, s.sec]}
				button1href={`/medibook/sessions/${params.sessionNumber}/departments?add`}
				button1text="Add Department"
			/>
			<div className="mx-auto max-w-[1200px] gap-[24px] p-5">
				<ul>
					{committees
						.sort((a, b) => {
							let aName = a.name.toLowerCase();
							let bName = b.name.toLowerCase();

							if (aName < bName) {
								return -1;
							}
							if (aName > bName) {
								return 1;
							}
							return 0;
						})
						.map((committee) => {
							return (
								<li className="my-2 list-none" key={committee.id}>
									<Link href={`/medibook/sessions/${params.sessionNumber}/departments/${committee.slug || committee.id}`}>
										<Card className="duration-300 hover:shadow-md">
											<CardHeader>
												<CardTitle>{capitaliseEachWord(committee.name)}</CardTitle>
												<CardDescription>{committee.description}</CardDescription>
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
