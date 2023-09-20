import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Drawer from "./Drawer";
import { TitleBar, e as s } from "@/components/medibook/TitleBar";
import { capitaliseEachWord } from "@/lib/capitaliseEachWord";

export const revalidate = 60;

async function getData(params) {
	return await prisma.department
		.findMany({
			where: { session: { number: params.sessionNumber } },
			orderBy: [{ name: "asc" }],
		})
		.catch(() => notFound());
}

const departmentTypes = {
	IT: "/pages/index/section3images/4.jpeg",
	SALES: "/pages/index/section3images/3.jpeg",
	MEDINEWS: "/pages/index/section3images/2.jpeg",
};

export default async function Page({ params }) {
	const departments = await getData(params);
	return (
		<>
			<Drawer props={params} />
			<TitleBar title="Departments" button1roles={[s.admins, s.sec]} button1href={`/medibook/sessions/${params.sessionNumber}/departments?add`} button1text="Add Department" />
			<ul className="mx-auto grid max-w-[1248px] gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
				{departments.length == 0 && <p>No departments found in selected session...</p>}
				{departments.map((department) => {
					return (
						<li key={department.id}>
							<Link href={`/medibook/sessions/${params.sessionNumber}/departments/${department.slug || department.id}`}>
								<Card
									className={`h-[212px] overflow-hidden border-0 bg-cover bg-center text-white shadow-2xl shadow-slate-900 duration-300 md:hover:shadow-md`}
									style={{ backgroundImage: `url(${departmentTypes[department.type] || "/pages/index/section3images/6.jpeg"})` }}>
									<div style={{ background: "radial-gradient(ellipse at bottom right, #AE2D2860 0%, #111 85%, #111 100%)" }} className="h-full w-full bg-black">
										<CardHeader>
											<CardTitle>{capitaliseEachWord(department.name)}</CardTitle>
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
