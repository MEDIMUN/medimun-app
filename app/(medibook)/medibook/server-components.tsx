import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { SessionResourceDropdown, TopBar } from "./client-components";
import { Link } from "@/components/link";
import { Badge } from "@/components/badge";
import { romanize } from "@/lib/romanize";
import { capitaliseEachWord } from "@/lib/text";
import { authorizedToEditResource } from "./@resourceModals/default";
import { auth } from "@/auth";
import { Divider } from "@/components/divider";
import { Text } from "@/components/text";
import { Button } from "@/components/button";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";

const columns = ["Name", "Uploader", "Date Uploaded", "Tags"];

export function ResourcesTable({ resources, isManagement, tableColumns = columns }) {
	const authSession = auth();
	return (
		<Table className="showscrollbar">
			<TableHead>
				<TableRow>
					{[<span className="sr-only">Actions</span>, ...tableColumns].map((row, i) => (
						<TableHeader key={i}>{row}</TableHeader>
					))}
				</TableRow>
			</TableHead>
			<TableBody>
				{resources.map((resource) => {
					const fullName = resource.user.displayName || `${resource.user.officialName} ${resource.user.officialSurname}`;
					return (
						<TableRow key={resource.id}>
							<TableCell>
								<SessionResourceDropdown authSession={authSession} selectedResource={resource} />
							</TableCell>
							{tableColumns.includes("Name") && (
								<TableCell>
									<Link
										target="_blank"
										className="hover:underline"
										href={resource.driveUrl ? `https://${resource.driveUrl}` : `/medibook/resources/${resource.id}`}>
										{resource.isPinned && "📌 "}
										{resource.name}
									</Link>
								</TableCell>
							)}
							{tableColumns.includes("Scope") && (
								<TableCell>
									<div className="mr-auto flex flex-wrap gap-1">
										{resource.scope.map((scope) => {
											if (scope.includes("SESSION")) {
												return (
													<Badge color="purple" className="max-w-min">
														{capitaliseEachWord(scope.replace("SESSION", ""))} (Session {romanize(resource?.session?.number)})
													</Badge>
												);
											}
											if (scope.includes("COMMITTEE")) {
												return (
													<Badge color="purple" className="max-w-min">
														{capitaliseEachWord(scope.replace("COMMITTEE", ""))} viewing {resource?.committee?.shortName || resource?.committee?.name}{" "}
														in Session {romanize(resource?.committee?.session.number)}
													</Badge>
												);
											}
											if (scope.includes("DEPARTMENT")) {
												return (
													<Badge color="purple" className="max-w-min">
														{capitaliseEachWord(scope.replace("DEPARTMENT", ""))} viewing{" "}
														{resource?.department?.shortName || resource?.department?.name} in Session{" "}
														{romanize(resource?.department?.session.number)}
													</Badge>
												);
											}
											if (scope.includes("PERSONAL")) {
												return (
													<Badge color="purple" className="max-w-min">
														{capitaliseEachWord(scope)}
													</Badge>
												);
											}
											return (
												<Badge color="purple" className="max-w-min">
													{capitaliseEachWord(scope)}
												</Badge>
											);
										})}
									</div>
								</TableCell>
							)}
							{tableColumns.includes("Uploader") && (
								<TableCell>{resource.isAnonymous ? (isManagement ? `${fullName} (Anonymous)` : "-") : fullName}</TableCell>
							)}
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

export function AnnouncementsTable({ title, announcements, isManagement, baseUrl }) {
	const authSession = auth();
	return (
		<>
			<TopBar className="mb-8" title={title || "Announcements"}>
				<Button href="/medibook/announcements/publish">Publish Announcement</Button>
			</TopBar>
			<Divider className="mt-10"></Divider>
			<ul className="grid grid-flow-row">
				{announcements.map((announcement, index) => {
					const fullName = announcement.user.displayName || `${announcement.user.officialName} ${announcement.user.officialSurname}`;
					const url = `${baseUrl}/${announcement.id}${announcement.slug ? "/" : ""}${announcement.slug ? announcement.slug : ""}`;
					return (
						<li key={announcement.id}>
							<div className="mx-1 my-6 flex gap-2 md:my-10">
								<div className="max-w-auto w-full">
									<Link href={url} className="!cursor-pointer hover:underline">
										<h3 className="text-base/6 font-semibold">{announcement.title}</h3>
									</Link>
									<Text className="mb-2 line-clamp-1">{announcement.description}</Text>
									<Text className="line-clamp-2">{announcement.markdown}</Text>
									<div className="mt-2 flex flex-wrap gap-2 md:flex-row">
										<Badge className="max-w-max px-2">
											{announcement?.privacy === "ANONYMOUS" && (isManagement ? `${fullName} (Anonymous)` : "Anonymous")}
											{announcement?.privacy === "BOARD" && (isManagement ? `${fullName} (Anonymous - Board of Directors)` : "Board of Directors")}
											{announcement?.privacy === "NORMAL" && fullName}
											{announcement?.privacy === "SECRETARIAT" && (isManagement ? `${fullName} (Secretariat)` : "Secretariat")}
										</Badge>
										<Badge className="max-w-max px-2">{announcement.time.toLocaleString("uk").replace(",", " -")}</Badge>
									</div>
								</div>
								<div className="ml-2 flex">
									<Dropdown>
										<DropdownButton className="my-auto max-h-max" plain aria-label="More options">
											<EllipsisVerticalIcon />
										</DropdownButton>
										<DropdownMenu anchor="bottom end">
											<DropdownItem href={url}>View</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								</div>
							</div>
							{!(index + 1 == announcements.length) && <Divider />}
						</li>
					);
				})}
			</ul>
		</>
	);
}
