import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Link } from "@/components/link";
import { Badge } from "@/components/badge";
import { romanize } from "@/lib/romanize";
import { capitaliseEachWord, processMarkdownPreview } from "@/lib/text";
import { auth } from "@/auth";
import { Divider } from "@/components/divider";
import { Text } from "@/components/text";
import Paginator from "@/components/pagination";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import { Subheading } from "@/components/heading";
import { announcementWebsitecomponents } from "../(medibook)/medibook/@announcement/default";
import { FastLink } from "@/components/fast-link";
import { ChevronLeft } from "lucide-react";

const columns = ["Name", "Uploader", "Date Uploaded", "Tags"];

export async function ResourcesTable({ resources, isManagement, tableColumns = columns }) {
	const authSession = await auth();
	if (!!resources.length)
		return (
			<Table className="showscrollbar">
				<TableHead>
					<TableRow>
						{[...tableColumns].map((row, i) => (
							<TableHeader key={i}>{row}</TableHeader>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{resources.map((resource) => {
						const fullName = resource.user.displayName || `${resource.user.officialName} ${resource.user.officialSurname}`;
						return (
							<TableRow key={resource.id}>
								{tableColumns.includes("Name") && (
									<TableCell>
										<Link target="_blank" className="hover:underline" href={resource.driveUrl ? `https://${resource.driveUrl}` : `/medibook/resources/${resource.id}`}>
											{resource.isPinned && "📌 "}
											{resource.name}
										</Link>
									</TableCell>
								)}
								{tableColumns.includes("Scope") && (
									<TableCell>
										<div className="mr-auto flex flex-wrap gap-1">
											{resource.scope.map((scope, index) => {
												if (scope.includes("SESSION")) {
													return (
														<Badge key={index} color="purple" className="max-w-min">
															{capitaliseEachWord(scope.replace("SESSION", ""))} (Session {romanize(resource?.session?.number)})
														</Badge>
													);
												}
												if (scope.includes("COMMITTEE")) {
													return (
														<Badge key={index} color="purple" className="max-w-min">
															{capitaliseEachWord(scope.replace("COMMITTEE", ""))} viewing {resource?.committee?.shortName || resource?.committee?.name} in Session {romanize(resource?.committee?.session.number)}
														</Badge>
													);
												}
												if (scope.includes("DEPARTMENT")) {
													return (
														<Badge key={index} color="purple" className="max-w-min">
															{capitaliseEachWord(scope.replace("DEPARTMENT", ""))} viewing {resource?.department?.shortName || resource?.department?.name} in Session {romanize(resource?.department?.session.number)}
														</Badge>
													);
												}
												if (scope.includes("PERSONAL")) {
													return (
														<Badge key={index} color="purple" className="max-w-min">
															{capitaliseEachWord(scope)}
														</Badge>
													);
												}
												return (
													<Badge key={index} color="purple" className="max-w-min">
														{capitaliseEachWord(scope)}
													</Badge>
												);
											})}
										</div>
									</TableCell>
								)}
								{tableColumns.includes("Uploader") && <TableCell>{resource.isAnonymous ? (isManagement ? `${fullName} (Anonymous)` : "-") : fullName}</TableCell>}
								{tableColumns.includes("Date Uploaded") && <TableCell>{resource.time.toLocaleString("uk-en").replace(",", " at")}</TableCell>}
								{tableColumns.includes("Tags") && (
									<TableCell>
										{resource.driveUrl ? (
											<Badge color="yellow" className="mr-2">
												External File
											</Badge>
										) : resource.fileId ? (
											<Badge color="green" className="mr-2">
												Local File
											</Badge>
										) : (
											<Badge className="mr-2">Unknown</Badge>
										)}
										{resource.isPrivate && (
											<Badge className="mr-2" color="red">
												Private
											</Badge>
										)}
										{resource.scope?.includes("SESSIONPROSPECTUS") && <Badge color="blue">Session Prospectus</Badge>}
									</TableCell>
								)}
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		);
}

const itemsPerPage = 10;

export async function AnnouncementsTable({ title, announcements, baseUrl, totalItems, buttonHref, buttonText, showPublishButton }) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	return (
		<>
			{!!announcements.length && (
				<ul className="grid grid-flow-row gap-6">
					{announcements.map((announcement, index) => {
						const fullName = announcement.user.displayName || `${announcement.user.officialName} ${announcement.user.officialSurname}`;
						const url = `${baseUrl}/${announcement.id}${announcement.slug ? "/" : ""}${announcement.slug ? announcement.slug : ""}`;
						const isTimeSame = announcement.time.toLocaleTimeString() == announcement.editTime.toLocaleTimeString();
						return (
							<li className="rounded-md bg-zinc-100 p-4" key={announcement.id}>
								<div className="flex gap-2">
									<div className="max-w-auto w-full">
										<Link href={url} className="!cursor-pointer hover:underline">
											<h3 className="text-base/6 font-semibold">{announcement.title}</h3>
										</Link>
										<Text className="mb-2 line-clamp-1">{announcement.description}</Text>
										<Text className="line-clamp-2">{processMarkdownPreview(announcement.markdown)}</Text>
										<div className="mt-2 flex flex-wrap gap-2 md:flex-row">
											<Badge className="max-w-max px-2">
												{announcement?.privacy === "ANONYMOUS" && (isManagement ? `${fullName} (Anonymous)` : "Anonymous")}
												{announcement?.privacy === "BOARD" && (isManagement ? `${fullName} (Anonymous - Board of Directors)` : "Board of Directors")}
												{announcement?.privacy === "NORMAL" && fullName}
												{announcement?.privacy === "SECRETARIAT" && (isManagement ? `${fullName} (Secretariat)` : "Secretariat")}
											</Badge>
											{isTimeSame ? (
												<Badge className="max-w-max px-2">{announcement.time.toLocaleString("uk").replace(",", " -")}</Badge>
											) : (
												<Badge className="max-w-max px-2">Edited {announcement.editTime.toLocaleString("uk").replace(",", " -")}</Badge>
											)}
										</div>
									</div>
								</div>
							</li>
						);
					})}
				</ul>
			)}
			<Paginator itemsOnPage={announcements.length} totalItems={totalItems} itemsPerPage={itemsPerPage} />
		</>
	);
}

export async function AnnouncementViewPage({ params, searchParams }) {
	const selectedAnnouncement = await prisma.announcement.update({
		where: { id: params.announcementId[0] },
		data: { views: { increment: 1 } },
		include: {
			session: true,
			committee: { include: { session: true } },
			department: { include: { session: true } },
			user: true,
		},
	});

	let baseUrl = "/announcements";

	if (selectedAnnouncement?.slug !== params?.announcementId[1]) {
		if (selectedAnnouncement?.slug) return redirect(`${baseUrl}/${selectedAnnouncement.id}/${selectedAnnouncement.slug}`);
	}

	if (!selectedAnnouncement) return;

	return (
		<>
			<Topbar title={selectedAnnouncement.title} />
			<div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
				<Suspense fallback={<div>404</div>}>
					{/* @ts-ignore */}
					<MDXRemote components={{ ...announcementWebsitecomponents }} source={selectedAnnouncement.markdown} />
				</Suspense>
				<Divider className="mt-[712px]" />
				<Subheading className="my-10 !font-extralight">
					{"We are not responsible for the contents of announcements. Please refer to our "}
					<Link className="underline hover:text-primary" href="/policies/conduct#announcements" target="_blank">
						code of conduct
					</Link>
					{" and "}
					<Link className="underline hover:text-primary" href="/policies/conduct#announcements" target="_blank">
						terms of service
					</Link>
					{" for more information."}
				</Subheading>
			</div>
		</>
	);
}

export function Topbar({ title, description, buttonText, buttonHref }: { title: string; description?: string; buttonText?: string; buttonHref?: string }) {
	return (
		<div className="relative bg-black font-[Gilroy] isolate pt-14">
			<div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
				<div
					style={{
						clipPath:
							"polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
					}}
					className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
				/>
			</div>
			<div className={`py-24 ${description ? "sm:py-32" : "sm:py-24"}`}>
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<div className="mx-auto max-w-7xl text-left">
						{buttonText && buttonHref && (
							<FastLink href={buttonHref}>
								<div className="text-sm min-w-max flex hover:bg-primary h-8 -translate-y-[10px] opacity-50 hover:opacity-100 -ml-[9px] -mt-1 mb-2 pl-[6px] rounded-full duration-200 leading-none max-w-min">
									<ChevronLeft className="size-4 my-auto  min-w-4 m-auto" />
									<Text className="mr-[11px] my-auto max-h-[16px] md:-translate-y-[3px] min-w-max text-sm">{buttonText}</Text>
								</div>
							</FastLink>
						)}
						<h1 className="text-balance text-5xl font-semibold max-w-3xl tracking-tight text-white sm:text-7xl font-canela">{title}</h1>
						{description && <p className="mt-8 text-pretty text-lg max-w-3xl font-medium text-gray-400 sm:text-xl/8">{description}</p>}
						{/* <div className="mt-10 flex items-center justify-center gap-x-6">
							<a
								href="#"
								className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400">
								Get started
							</a>
							<a href="#" className="text-sm/6 font-semibold text-white">
								Learn more <span aria-hidden="true">→</span>
							</a>
						</div> */}
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<div className="pb-[58px] pt-24 text-left font-[Montserrat] sm:pb-[72px] sm:pt-32 lg:text-center">
			<div className="mx-auto max-w-7xl  px-6 lg:px-8">
				<div className="mx-auto max-w-2xl bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text lg:mx-auto">
					<h2 className="mx-auto text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
					{description && <p className="mt-4 text-lg leading-8 text-gray-300">{description}</p>}
				</div>
			</div>
		</div>
	);
}
