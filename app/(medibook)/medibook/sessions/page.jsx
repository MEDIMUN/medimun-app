import prisma from "@/prisma/client";
import SearchBar from "./SearchBar";
import Link from "next/link";
import SubMenu from "@/components/medibook/SubMenu";
import Drawer from "./Drawer";
import { TitleBar, e as s } from "@/components/medibook/TitleBar";

export const metadata = {
	title: "Sessions - MediBook",
	description: "All Sessions of the Mediterranean Model United Nations",
};

const menuItems = [
	{
		title: "Home",
		href: "/medibook",
	},
	{
		title: "Sessions",
		href: `/medibook/sessions`,
	},
	{
		title: "Announcements",
		href: `/medibook/announcements`,
	},
	{
		title: "Users",
		href: `/medibook/users`,
	},
];

export default async function Page() {
	const data = await GetData();
	return (
		<>
			<Drawer />
			<SubMenu menuItems={menuItems} />
			<TitleBar title="Sessions" button1roles={[s.admins, s.sd]} button1href={`/medibook/sessions?add`} button1text="Add Session" />
			<div className="mx-auto max-w-[1248px] p-6">
				<SearchBar />
				<div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{data.length === 0 && (
						<div className="col-span-3 row-span-3 flex w-full text-center align-middle">
							<h2 className="m-auto">No Sessions found</h2>
						</div>
					)}
					{data.map((session) => (
						<Link href={`/medibook/sessions/${session.number}`}>
							<div className="relative h-[212px] rounded-lg border-[1px] border-[#E2E8F0] p-[24px] shadow-md duration-200 md:hover:shadow-xl lg:hover:shadow-xl" key={session.id}>
								<div className="flex flex-row align-middle">
									<h2 className={`${session.isCurrent ? "bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%" : "bg-black"} my-auto mr-5 flex h-[40px] w-[40px] justify-center rounded-3xl px-3 align-middle text-[24px] text-white shadow-xl`}>
										<span className="my-auto font-thin">{session.number}</span>
									</h2>
									<div className="leading-[20px]">
										<h4>
											<b>{session.theme || "Session " + session.number}</b>
										</h4>
										<h4>{session.phrase2 || "Session " + session.roman} </h4>
									</div>
								</div>
								<div className="mt-4 grid h-[84px]">
									{session.secretariat && <h3 className="font-thin">Secretariat</h3>}
									<h4 className="line-clamp-3 max-h-[60px] min-h-[60px] text-sm text-gray-600">{session.secretariat ? session.secretariat : null}</h4>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
		</>
	);
}

async function GetData() {
	await prisma.$connect();
	let data;
	try {
		data = await prisma.session.findMany({
			take: 9,
			orderBy: {
				numberInteger: "desc",
			},
			include: {
				secretaryGeneral: {
					include: {
						User: {
							select: {
								officialName: true,
								officialSurname: true,
							},
						},
					},
				},
				presidentOfTheGeneralAssembly: {
					include: {
						user: {
							select: {
								officialName: true,
								officialSurname: true,
							},
						},
					},
				},
				deputySecretaryGeneral: {
					include: {
						user: {
							select: {
								officialName: true,
								officialSurname: true,
							},
						},
					},
				},
				deputyPresidentOfTheGeneralAssembly: {
					include: {
						user: {
							select: {
								officialName: true,
								officialSurname: true,
							},
						},
					},
				},
			},
		});
	} catch (e) {
		return [];
	}

	const sessions = data.map((session) => {
		const secretaryGeneral = session.secretaryGeneral.map((secretaryGeneral) => {
			return secretaryGeneral.User.officialName + " " + secretaryGeneral.User.officialSurname + " (SG)";
		});

		const presidentOfTheGeneralAssembly = session.presidentOfTheGeneralAssembly.map((presidentOfTheGeneralAssembly) => {
			return presidentOfTheGeneralAssembly.user.officialName + " " + presidentOfTheGeneralAssembly.user.officialSurname + " (PGA)";
		});

		const deputySecretaryGeneral = session.deputySecretaryGeneral.map((deputySecretaryGeneral) => {
			return deputySecretaryGeneral.user.officialName + " " + deputySecretaryGeneral.user.officialSurname + " (DSG)";
		});

		const deputyPresidentOfTheGeneralAssembly = session.deputyPresidentOfTheGeneralAssembly.map((deputyPresidentOfTheGeneralAssembly) => {
			return deputyPresidentOfTheGeneralAssembly.user.officialName + " " + deputyPresidentOfTheGeneralAssembly.user.officialSurname + " (DPGA)";
		});

		secretaryGeneral + presidentOfTheGeneralAssembly + deputySecretaryGeneral + deputyPresidentOfTheGeneralAssembly;

		function romanize(num) {
			let lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 },
				roman = "",
				i;
			for (i in lookup) {
				while (num >= lookup[i]) {
					roman += i;
					num -= lookup[i];
				}
			}
			return roman;
		}

		let secretariat = (secretaryGeneral + "," + presidentOfTheGeneralAssembly + "," + deputySecretaryGeneral + "," + deputyPresidentOfTheGeneralAssembly).split(",").join(", ");
		if (secretariat === ", , , ") {
			secretariat = "";
		}

		return {
			id: session.id,
			number: session.number,
			roman: romanize(session.number),
			theme: session.theme,
			phrase2: session.phrase2,
			isCurrent: session.isCurrent,
			secretariat: secretariat,
		};
	});
	return sessions.filter((session) => session.number !== 0);
}
