import { Link } from "@nextui-org/link";
import { Button } from "@nextui-org/button";
import { Tooltip } from "@nextui-org/tooltip";
import { authorize, s } from "@/lib/authorize";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import AddModal from "./modals";
import prisma from "@/prisma/client";
import Paginator from "@/components/Paginator";
import { Icon } from "@/components/icon";
import { EditCommitteeButton } from "./buttons";
import { Suspense } from "react";
import SearchBar from "../resources/SearchBar";
import { Chip } from "@nextui-org/chip";

const committeeTypeMap = {
	SPECIALCOMMITTEE: "Special Committee",
	SECURITYCOUNCIL: "Security Council",
	GENERALASSEMBLY: "General Assembly",
};

export default async function Component({ params, searchParams }) {
	const committeesPerPage = 10;
	const currentPage = searchParams.page || 1;
	let commmittees: any, edit: any, session: any;

	if (searchParams.edit) {
		edit = prisma.committee.findFirst({ where: { id: searchParams.edit || "" } }).catch(notFound);
	} else {
		edit = Promise.resolve(null);
	}

	commmittees = prisma.committee
		.findMany({
			where: { session: { number: params.sessionNumber }, name: { contains: searchParams.search, mode: "insensitive" } },
			include: { chair: { include: { user: true } }, delegate: { include: { user: true } } },
			orderBy: [{ type: "asc" }, { name: "asc" }],
			skip: (currentPage - 1) * committeesPerPage,
			take: committeesPerPage,
		})
		.catch(notFound);

	session = getServerSession(authOptions as any);

	[commmittees as any, edit as any, session] = await Promise.all([commmittees, edit, session]);

	const currentCommitteeIds = [...session.currentRoles, ...session.pastRoles]
		.filter((role) => role.session == params.sessionNumber)
		.filter((role) => role.name == "Chair" || role.name == "Delegate")
		.map((role) => role.committeeId);

	commmittees = commmittees.sort((a: any, b: any) => {
		if (currentCommitteeIds.includes(a.id) && !currentCommitteeIds.includes(b.id)) return -1;
		if (currentCommitteeIds.includes(b.id) && !currentCommitteeIds.includes(a.id)) return 1;
		return 0;
	});

	//sort committees such that Security Council comes before Historical Security Council both have the same type just check the name but make this case insensitive
	commmittees = commmittees.sort((a: any, b: any) => {
		if (a.name.toLowerCase().includes("security council") && b.name.toLowerCase().includes("historical security council")) return -1;
		if (b.name.toLowerCase().includes("security council") && a.name.toLowerCase().includes("historical security council")) return 1;
		return 0;
	});

	const isManagement = authorize(session, [s.management]);

	const total = await prisma.committee
		.count({
			where: { session: { number: params.sessionNumber } },
		})
		.catch();

	return (
		<>
			<AddModal edit={edit} sessionNumber={params.sessionNumber} />
			<div className="flex w-full grid-cols-3 flex-wrap gap-4 ">
				{(commmittees as any).map((committee: any, index: number) => {
					const chairs = committee?.chair;
					const chairsLength = chairs.length;
					return (
						<li key={index} style={{ animationDelay: `${index * 25}ms` }} className={`flex w-full animate-appearance-in flex-col gap-2 rounded-xl border-black/10 bg-content1/60 p-4 shadow-sm duration-200 hover:shadow-md dark:border-white/20 md:flex-row`}>
							<div className="flex flex-col gap-1">
								<div className="mb-[-10px] line-clamp-4 flex gap-2 bg-gradient-to-br from-foreground-800 to-foreground-500 bg-clip-text text-xl font-semibold tracking-tight text-transparent dark:to-foreground-200">
									<p>{committee.name}</p>
									{currentCommitteeIds.includes(committee.id) && <Chip className="mt-1 max-h-[18px] rounded-md bg-primary/90 px-0 text-xs font-medium text-white dark:border-white/20 md:my-auto">My Committee</Chip>}
								</div>
								<p className="mt-1 line-clamp-2 text-default-400">
									{!chairsLength && committeeTypeMap[committee.type]}
									{!!chairsLength && "Chaired by "}
									{chairs.map((chair: any, index: number) => {
										const user = chair?.user;
										const fullName = user?.displayName || user?.officialName + " " + user?.officialSurname || "";
										return (
											<span key={index}>
												{fullName}
												{chairsLength - 1! > index + 1 && ", "}
												{chairsLength - 1 == index + 1 && " & "}
											</span>
										);
									})}
								</p>
							</div>
							<div className="flex flex-col gap-2 md:ml-auto">
								<div className="my-auto flex gap-2">
									{isManagement && <EditCommitteeButton committeeId={committee.id} />}
									<Button endContent={<Icon icon="solar:arrow-right-outline" width={20} />} as={Link} href={`/medibook/sessions/${params.sessionNumber}/committees/${committee.slug || committee.id}`} fullWidth className="-border-small my-auto border-black/10 bg-black/10 shadow-md light:text-black dark:border-white/20 dark:bg-white/10 md:w-full">
										View
									</Button>
								</div>
							</div>
						</li>
					);
				})}
			</div>
			<div className="mx-auto mt-auto flex w-full justify-center">
				<Suspense fallback={<Paginator page={1} total={1} />}>
					<Paginator page={currentPage} total={Math.ceil((total as number) / committeesPerPage)} />
				</Suspense>
			</div>
		</>
	);
}
