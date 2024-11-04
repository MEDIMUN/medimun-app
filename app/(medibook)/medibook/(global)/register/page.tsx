import { TopBar } from "../../client-components";
import QRCode from "react-qr-code";
import { QRReader, RegisterQRCodeBox } from "./client-components";
import { auth } from "@/auth";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { authorize, authorizeDirect, s } from "@/lib/authorize";
import Image from "next/image";
import Confirm from "@/public/assets/confirm.gif";
import { Code, Text } from "@/components/text";
import { ActionList } from "../../server-components";
import { InformationCircleIcon } from "@heroicons/react/16/solid";

export default async function RegistrationPage() {
	const authSession = await auth();
	if (!authSession) notFound();

	const isManagement = authorize(authSession, [s.management]);
	const isManager = authorizeDirect(authSession, [s.manager]);
	const isDelegate = authorizeDirect(authSession, [s.delegate]);
	const isMember = authorizeDirect(authSession, [s.member]);
	const allowedMemberDepartmentTypes = ["PI", "IT", "ADMIN"];
	const isMemberOfPIorIT =
		isMember &&
		authSession?.user.currentRoles
			.filter((role) => role.roleIdentifier == "member")
			.filter((role) => role?.departmentTypes?.some((type) => allowedMemberDepartmentTypes?.includes(type))).length > 0;

	if (!isManagement && !isManager && !isDelegate && !isMember) notFound();

	/* 	await prisma.$transaction([prisma.morningCode.deleteMany({ where: { userId: authSession.user.id } })]);
	 */
	const cyprusMidnightString = new Date().toISOString().split("T")[0].concat("T00:00:00.000Z");
	const today = new Date(cyprusMidnightString);

	const selectedDay = await prisma.day.findUniqueOrThrow({ where: { date: today } }).catch(notFound);

	let code,
		isPresent = null;
	if (isDelegate || isMember) {
		isPresent = await prisma.morningPresent
			.findUnique({ where: { userId_dayId: { userId: authSession.user.id, dayId: selectedDay.id } } })
			.catch(notFound);

		if (!isPresent) {
			[, code] = await prisma
				.$transaction([
					prisma.morningCode.deleteMany({
						where: { userId: authSession.user.id },
					}),
					prisma.morningCode.upsert({
						where: {
							userId_dayId: {
								userId: authSession.user.id,
								dayId: selectedDay.id,
							},
						},
						create: {
							dayId: selectedDay.id,
							userId: authSession.user.id,
						},
						update: {},
					}),
				])
				.catch(notFound);
		}
	}

	const actions = [
		{
			title: "All Sessions",
			description: "View all sessions",
			href: `/medibook/sessions`,
		},
		{
			title: "School Director Applications",
			description: "Applications for the position of School Director",
			href: `/medibook/sessions/20/apply/school-director`,
		},
		{
			title: "Global Announcements",
			description: "View all global announcements",
			href: `/medibook/announcements`,
		},
		{
			title: "Session Announcements",
			description: "View all the announcements from the latest session",
			href: `/medibook/sessions/20/announcements`,
		},
		{
			title: "Global Resources",
			description: "View all global resources",
			href: `/medibook/resources`,
		},
		{
			title: "Session Resources",
			description: "View all the resources from the latest session",
			href: `/medibook/sessions/20/resources`,
		},
		{
			title: "Policies",
			description: "View conference rules and policies.",
			href: `/medibook/policies`,
		},
		{
			title: "Account Settings",
			description: "Change your account settings and add personal information",
			href: `/medibook/account`,
		},
	];

	const userId = authSession.user.id;

	if (!isManagement && !isManager && !!isPresent && !isMemberOfPIorIT)
		return (
			<>
				<TopBar
					title="Morning Registration"
					hideSearchBar
					buttonHref="/medibook"
					buttonText="Home"
					subheading={`Your User ID is ${userId.slice(0, 4)}-${userId.slice(4, 8)}-${userId.slice(8, 12)}`}
				/>
				<div className="border flex gap-2 md:flex-row flex-col shadow-lg shadow-content1 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] relative z-[10000] animate-shimmer bg-[length:200%_100%] p-4 rounded-xl bg-content1/60 text-center">
					<div className="md:h-[40px] h-[60px] w-[60px] m-8 md:m-0 md:w-[40px] mx-auto md:mx-0">
						<Image alt="Tick" src={Confirm} unoptimized className="!select-none aspect-square h-[60px] md:h-[40px] object-scale-down !relative" />
					</div>
					<Text className="!text-white m-auto font-[montserrat] !text-lg">You have been registered for today.</Text>
					{isPresent?.id && (
						<Text className="mb-1 md:hidden">
							<i>{isPresent.id}</i>
						</Text>
					)}
					<div className="rounded-md md:hidden bg-zinc-50 p-4 z-[100] mt-8">
						<div className="flex">
							<div className="md:flex">
								<p className="text-sm text-zinc-700">Have your QR code ready for each day of the conference.</p>
							</div>
						</div>
					</div>
				</div>
				<ActionList actions={actions} />
			</>
		);

	if ((isMember && !isPresent) || isDelegate)
		return (
			<>
				<TopBar
					title="Morning Registration"
					hideSearchBar
					buttonHref="/medibook"
					buttonText="Home"
					subheading={`Your User ID is ${userId.slice(0, 4)}-${userId.slice(4, 8)}-${userId.slice(8, 12)}`}
				/>
				<RegisterQRCodeBox code={code.code} />
				<Text>
					Show this code to a member of staff in the morning at the door when you arrive. You can also ask your chair to register you if you are
					unable to do so yourself. Further roll calls will be taken throughout the day by your chairs.
				</Text>
			</>
		);

	if (isManager || isManagement || (isMemberOfPIorIT && isPresent))
		return (
			<>
				<TopBar
					title="Registration Scanner"
					hideSearchBar
					buttonHref="/medibook"
					buttonText="Home"
					subheading={`Your User ID is ${userId.slice(0, 4)}-${userId.slice(4, 8)}-${userId.slice(8, 12)}`}
				/>
				{isPresent && (
					<div className="border flex gap-2 md:flex-row flex-col shadow-lg shadow-content1 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] relative z-[10000] animate-shimmer bg-[length:200%_100%] p-4 rounded-xl bg-content1/60 text-center">
						<div className="h-[40px] w-[40px] mx-auto md:mx-0">
							<Image alt="Tick" src={Confirm} unoptimized className="select-none aspect-square h-[40px] object-scale-down !relative" />
						</div>
						<Text className="!text-white m-auto font-[montserrat] !text-lg">You have been registered for today.</Text>
					</div>
				)}
				<QRReader />
				<Text>
					Scan the QR code of a Delegate or Member to register them in the morning. Members can only register delegates while managers and management
					members can register both delegates and members.
				</Text>
			</>
		);
}
