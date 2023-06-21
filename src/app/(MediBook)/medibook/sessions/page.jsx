import prisma from "@/prisma/client";
import SearchBar from "./SearchBar";
import Link from "next/link";
import SubMenu from "./SubMenu";

export const metadata = {
	title: "Sessions - MediBook",
	description: "All Sessions of the Mediterranean Model United Nations",
};

export default async function Page() {
	const data = await GetData();
	return (
		<>
			<SubMenu />
			<div className="p-5 max-w-[1200px] mx-auto">
				<SearchBar />
				<div className="mt-5 gap-[24px]  grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
					{data.map((session) => (
						<div className="h-[212px] relative p-[24px] rounded-lg border-[1px] shadow-md md:hover:shadow-xl lg:hover:shadow-xl border-[#E2E8F0] duration-200" key={session.id}>
							<Link href={`/medibook/sessions/${session.number}`}>
								<div className="flex flex-row align-middle">
									<h2 className={`${session.isCurrent ? "bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%" : "bg-black"} text-[24px] px-3 h-[40px] w-[40px] flex align-middle justify-center my-auto mr-5 shadow-xl text-white rounded-3xl`}>
										<span className="my-auto font-thin">{session.number}</span>
									</h2>
									<div className="leading-[20px]">
										<h4>
											<b>{session.theme || "Session " + session.number}</b>
										</h4>
										<h4>{session.phrase2 || "Session " + session.roman} </h4>
									</div>
								</div>
								<div className="grid h-[84px] mt-4">
									{session.secretariat && <h3 className="font-thin">Secretariat</h3>}
									<h4 className="text-sm min-h-[60px] max-h-[60px] text-gray-600 line-clamp-3">{session.secretariat ? session.secretariat : null}</h4>
								</div>
							</Link>
							<div className="flex absolute flex-row">
								<Link className="mt-2.5 text-sm font-thin text-gray-500 -translate-x-2 mr-2 px-2 hover:bg-black hover:shadow-md hover:rounded-2xl hover:text-white" href={`/medibook/sessions/${session.number}`}>
									Explore
								</Link>
								<Link className="mt-2.5 text-sm font-thin text-gray-500 -translate-x-2 mr-2 px-2 hover:bg-black hover:shadow-md hover:rounded-2xl hover:text-white" href={`/medibook/sessions/${session.number}?action=edit`}>
									Edit
								</Link>
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	);
}

async function GetData() {
	await prisma.$connect();
	const data = await prisma.session.findMany({
		take: 9,
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

	/* 	console.log(sessions);
	 */
	return sessions.sort((a, b) => {
		if (parseInt(a) > parseInt(b)) {
			return -1;
		} else {
			return 1;
		}
	});
}
