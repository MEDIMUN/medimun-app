import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AiOutlineInstagram } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { countries } from "@/data/countries";
import { userData } from "@/lib/user-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Page({ params }) {
	const { user, currentRoleNames, pastRoleNames, pastRoles, currentRoles } = await getData(params);
	const session = await getServerSession(authOptions);

	const badge1 = user.pronoun1 || user.pronoun2 ? user.pronoun1 + " / " + user.pronoun2 : "";
	const badge2 = currentRoleNames[0] || (pastRoleNames.length > 0 && "Alumni") || "Applicant";
	const badge3 = user.nationality ? user.nationality.flag + " " + user.nationality.countryNameEn : "";

	return (
		<div className="bg-[#f5f5f5] duration-300">
			<div className="h-auto w-full bg-gray-300">
				<div className="mx-auto flex max-h-[180px] max-w-[1000px] flex-col gap-2 p-2 md:flex-row md:gap-5 md:p-5">
					<Image
						alt="Profile Picture"
						width={300}
						height={300}
						quality={75}
						className="mx-auto mt-6 aspect-square h-full min-h-[200px] w-full max-w-[200px] rounded-[300px] border-[6px] border-[#f5f5f5] bg-[url(/placeholders/pfp.jpg)] bg-cover object-cover shadow-gray-500 md:mx-0"
						src={`${process.env.NEXTAUTH_URL}/api/user/${user.id}/profilePicture`}
					/>
					<div className="md:mt-auto">
						<p className="h-auto text-center font-[montserrat] text-[40px] font-[700] uppercase md:text-left">
							{user.displayName || user.officialName + " " + user.officialSurname}
						</p>
						<div className="flex justify-center gap-2 md:justify-normal">
							{badge1 && <Badge className="rounded-lg">{badge1}</Badge>}
							{badge2 && <Badge className="rounded-lg">{badge2}</Badge>}
							{badge3 && <Badge className="rounded-lg">{badge3}</Badge>}
						</div>
					</div>
					<div className="ml-auto mt-[10px] flex w-full gap-2 p-3 md:mt-auto md:w-auto md:p-0">
						{session.user.id === user.id ? (
							<Link href="/medibook/account">
								<Button className="w-[50%] bg-gray-200 text-black hover:bg-medired hover:text-white md:w-auto">Edit Profile</Button>
							</Link>
						) : (
							<Link href="/medibook/messages">
								<Button className="w-[50%] bg-gray-200 text-black hover:bg-medired hover:text-white md:w-auto">Message</Button>
							</Link>
						)}
					</div>
				</div>
			</div>
			<div className="mt-[200px] w-full md:mt-[75px]">
				<div className="mx-auto flex max-w-[1000px] flex-row gap-5 p-5">{user.bio && <p className="rounded-md bg-gray-200 p-5 font-[montserrat] font-[400]">{user.bio}</p>}</div>
			</div>

			<div className="my-auto">
				<div className="mx-auto  flex min-h-screen  flex-col border-[#ccc] font-[montserrat] lg:flex-row">
					<div className="mx-auto h-full max-w-[500px] overflow-hidden p-4 md:p-10">
						<div className="mt-3 "></div>
						<div className="font-[montserrat]"></div>
					</div>
					<div className="mx-auto w-full max-w-[500px] p-4 md:p-10">
						{currentRoles.length > 0 && (
							<div>
								Current Roles
								<ul>
									{currentRoles.map((role) => (
										<li key={Math.random()}>
											{role.name}
											{role.committee || (role.department && " at ")}
											{role.department}
											{role.committee}
										</li>
									))}
								</ul>
							</div>
						)}
						{pastRoles.length > 0 && (
							<div defaultValue="currentRoles" className="mt-4 w-full rounded-xl bg-black p-2">
								<p className="ml-2 w-full rounded-[300px] text-white">Past Roles</p>
								<ul className="mt-2 flex flex-col gap-2">
									{pastRoles.map((role) => (
										<li key={Math.random()}>
											<Card className="border-0 bg-[#f5f5f5] shadow-none">
												<CardHeader className="p-2">
													<CardTitle className="flex">
														{role.name}
														{(role.committee || role.department) && " at "}
														{role.department}
														{role.committee}
														{(role.committee || role.department) && <Badge className="my-auto ml-2">{(role.committee || role.department) && "Session" + " " + role.session}</Badge>}
													</CardTitle>
												</CardHeader>
											</Card>
										</li>
									))}
								</ul>
							</div>
						)}
						<div defaultValue="currentRoles" className="mt-4 w-full rounded-xl bg-black p-2">
							<p className="ml-2 w-full rounded-[300px] text-white">Awards</p>
							<ul className="mt-2 flex flex-col gap-2">
								{currentRoles.map((role) => (
									<li key={Math.random()}>
										<Card className="border-0 bg-[#f5f5f5] shadow-none">
											<CardHeader className="p-2">
												<CardTitle className="flex">
													{role.name}
													{(role.committee || role.department) && " at "}
													{role.department}
													{role.committee}
													{(role.committee || role.department) && <Badge className="my-auto ml-2">{(role.committee || role.department) && "Session" + " " + role.session}</Badge>}
												</CardTitle>
											</CardHeader>
										</Card>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

async function getData(params) {
	let userId = params.userId;
	if (userId.includes("%40")) userId = userId.split("%40")[1];
	const user = await userData(userId);
	if (!user) notFound();
	return user;
}
