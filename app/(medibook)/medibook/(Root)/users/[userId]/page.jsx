import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import style from "./page.module.css";
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

export default async function Page({ params }) {
	const { user, currentRoleNames, pastRoleNames, pastRoles, currentRoles } = await getData(params);
	console.log(user, currentRoleNames, pastRoleNames, pastRoles, currentRoles);
	return (
		<div className="my-auto bg-[#f5f5f5]">
			<div className="mx-auto  flex min-h-screen max-w-[1000px] flex-col border-[#ccc] font-[montserrat] lg:flex-row">
				<div className="mx-auto h-full max-w-[500px] overflow-hidden p-4 md:p-10">
					<Image
						alt="Profile Picture"
						width={300}
						height={300}
						quality={75}
						className="aspect-square h-full w-full max-w-[200px] rounded-[200px] bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 object-cover shadow-lg shadow-gray-500"
						src={`${process.env.NEXTAUTH_URL}/api/user/${user.id}/profilePicture`}
					/>
					<div className="mt-3 font-[montserrat] text-[40px] font-[700] uppercase">
						<p className="h-auto">{user.displayName || user.officialName + " " + user.officialSurname}</p>
						<div className="mb-3 mt-1 flex max-w-max flex-row gap-2 rounded-2xl ">
							{(user.pronoun1 || user.pronoun2) && (
								<Badge className="">
									{user.pronoun1} / {user.pronoun2}
								</Badge>
							)}
							<Badge>{currentRoleNames[0] || (pastRoleNames.length > 0 && "Alumni") || "Applicant"}</Badge>
							{user.nationality && (
								<Badge>
									{user.nationality.flag} {user.nationality.countryNameEn}
								</Badge>
							)}
						</div>
					</div>
					<div className="font-[montserrat]">
						<p>
							Lorem ipsum dolor sit amet, consectetur adipisicing elit. Similique fuga, doloremque corporis tempore veritatis saepe animi optio maiores! Molestias dicta culpa
							fugit! Suscipit illo quasi esse delectus veritatis necessitatibus fugit. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officiis sint eaque doloribus
						</p>
					</div>
				</div>
				<div className="mx-auto w-full max-w-[500px] p-4 md:p-10 lg:mt-[220px]">
					{currentRoles.length > 0 && (
						<div defaultValue="currentRoles" className="w-full rounded-xl bg-black p-2">
							<p className="ml-2 w-full rounded-[300px] text-white">Current Roles</p>
							<ul className="mt-2 flex flex-col gap-2">
								{currentRoles.map((role) => (
									<li key={Math.random()}>
										<Card className="border-0 bg-[#f5f5f5] shadow-none">
											<CardHeader className="p-2">
												<CardTitle>
													{role.name}
													{role.committee || (role.department && " at ")}
													{role.department}
													{role.committee}
												</CardTitle>
											</CardHeader>
										</Card>
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
	);
}

async function getData(params) {
	let userId = params.userId;
	if (userId.includes("%40")) {
		userId = userId.split("%40")[1];
	}
	console.log(userId);
	const user = await userData(userId);
	if (!user) {
		notFound();
	}
	return user;
}
