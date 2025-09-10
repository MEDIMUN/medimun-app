import { TopBar } from "../../client-components";
import { QRReader, RegisterQRCodeBox } from "./client-components";
import { auth } from "@/auth";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { authorize, authorizeDirect, s } from "@/lib/authorize";
import Image from "next/image";
import Confirm from "@/public/assets/confirm.gif";
import { Text } from "@/components/text";
import { ActionList } from "@/app/components/actions-list";
import { MainWrapper } from "@/components/main-wrapper";
import { connection } from "next/server";
import { Suspense } from "react";

export default function Page(props) {
	return (
		<Suspense fallback={<TopBar title="Morning Registration" buttonText="Home" buttonHref="/medibook" hideSearchBar hideBackdrop />}>
			<Registration {...props} />
		</Suspense>
	);
}

export async function Registration(props) {
	await connection();
	const authSession = await auth();
	if (!authSession) notFound();

	const isManagement = authorize(authSession, [s.management]);
	const isManager = authorizeDirect(authSession, [s.manager]);
	const isDelegate = authorizeDirect(authSession, [s.delegate]);
	const isMember = authorizeDirect(authSession, [s.member]);
	const allowedMemberDepartmentTypes = ["PI", "IT", "ADMIN"];
	const isMemberOfPIorIT =
		isMember && authSession?.user.currentRoles.filter((role) => role.roleIdentifier == "member").filter((role) => role?.departmentTypes?.some((type) => allowedMemberDepartmentTypes?.includes(type))).length > 0;

	if (!isManagement && !isManager && !isDelegate && !isMember) notFound();

	/* 	await prisma.$transaction([prisma.morningCode.deleteMany({ where: { userId: authSession.user.id } })]);
	 */
	const cyprusMidnightString = new Date().toISOString().split("T")[0].concat("T00:00:00.000Z");
	const today = new Date(cyprusMidnightString);

	const selectedDay = await prisma.day.findFirst({ where: { date: today } });

	if (!selectedDay)
		return (
			<>
				<TopBar
					hideBackdrop
					title="Morning Registration"
					hideSearchBar
					buttonHref="/medibook"
					buttonText="Home"
					subheading={`Your User ID is ${authSession.user.id.slice(0, 4)}-${authSession.user.id.slice(4, 8)}-${authSession.user.id.slice(8, 12)}`}
				/>
				<MainWrapper>
					<Text>
						Keep this page open before arriving at the conference on any conference or workshop day. Delegates and members must show their QR code to enter the conference venue. On conference days, a QR code will be displayed
						on this page.
					</Text>
				</MainWrapper>
			</>
		);

	let code,
		isPresent = null;
	if (isDelegate || isMember) {
		isPresent = await prisma.morningPresent.findUnique({ where: { userId_dayId: { userId: authSession.user.id, dayId: selectedDay.id } } }).catch(notFound);

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
				<TopBar hideBackdrop title="Morning Registration" hideSearchBar buttonHref="/medibook" buttonText="Home" subheading={`Your User ID is ${userId.slice(0, 4)}-${userId.slice(4, 8)}-${userId.slice(8, 12)}`} />
				<MainWrapper>
					<div className="border flex gap-2 md:flex-row flex-col shadow-lg shadow-content1 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] relative z-10000 animate-shimmer bg-size-[200%_100%] p-4 rounded-xl bg-content1/60 text-center">
						<div className="md:h-[40px] h-[60px] w-[60px] m-8 md:m-0 md:w-[40px] mx-auto md:mx-0">
							<Image alt="Tick" src={Confirm} unoptimized className="select-none! aspect-square h-[60px] md:h-[40px] object-scale-down relative!" />
						</div>
						<Text className="text-white! m-auto font-[montserrat] text-lg!">You have been registered for today.</Text>
						{isPresent?.id && (
							<Text className="mb-1 md:hidden">
								<i>{isPresent.id}</i>
							</Text>
						)}
						<div className="rounded-md md:hidden bg-zinc-50 p-4 z-100 mt-8">
							<div className="flex">
								<div className="md:flex">
									<p className="text-sm text-zinc-700">Have your QR code ready for each day of the conference.</p>
								</div>
							</div>
						</div>
					</div>
					<ActionList actions={actions} />
				</MainWrapper>
			</>
		);

	if ((isMember && !isPresent) || isDelegate)
		return (
			<>
				<TopBar hideBackdrop title="Morning Registration" hideSearchBar buttonHref="/medibook" buttonText="Home" subheading={`Your User ID is ${userId.slice(0, 4)}-${userId.slice(4, 8)}-${userId.slice(8, 12)}`} />
				<MainWrapper>
					<RegisterQRCodeBox code={code.code} />
					<Text>Show this code to a member of staff in the morning at the door when you arrive.</Text>
				</MainWrapper>
			</>
		);

	let delegates = [] as any;
	const query = (await props.searchParams).search || "";

	if ((isManagement || isManager || isMemberOfPIorIT) && query) {
		delegates = await prisma.user.findMany({
			take: 10,
			omit: { signature: true },
			include: {
				MorningPresent: {
					where: {
						dayId: selectedDay.id,
					},
				},
				Student: true,
				delegate: {
					select: {
						committee: {
							select: {
								name: true,
							},
						},
					},
				},
			},
			where: {
				OR: [
					{ officialName: { contains: query, mode: "insensitive" } },
					{ officialSurname: { contains: query, mode: "insensitive" } },
					{ displayName: { contains: query, mode: "insensitive" } },
					{ id: { contains: query, mode: "insensitive" } },
					{ Student: { name: { contains: query, mode: "insensitive" } } },
				],
				delegate: {
					some: {
						committee: {
							session: {
								Day: {
									some: {
										date: today,
									},
								},
							},
						},
					},
				},
			},
		});
	}

	if (isManager || isManagement || (isMemberOfPIorIT && isPresent))
		return (
			<>
				<TopBar hideBackdrop title="Registration Scanner" hideSearchBar buttonHref="/medibook" buttonText="Home" subheading={`Your User ID is ${userId.slice(0, 4)}-${userId.slice(4, 8)}-${userId.slice(8, 12)}`} />
				<MainWrapper>
					{isPresent && (
						<div className="border flex gap-2 md:flex-row flex-col shadow-lg shadow-content1 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] relative z-10000 animate-shimmer bg-size-[200%_100%] p-4 rounded-xl bg-content1/60 text-center">
							<div className="h-[40px] w-[40px] mx-auto md:mx-0">
								<Image alt="Tick" src={Confirm} unoptimized className="select-none aspect-square h-[40px] object-scale-down relative!" />
							</div>
							<Text className="text-white! m-auto font-[montserrat] text-lg!">You have been registered for today.</Text>
						</div>
					)}
					<QRReader delegates={delegates} />
					<Text>Scan the QR code of a Delegate or Member to register them in the morning. Members can only register delegates while managers and management members can register both delegates and members.</Text>
				</MainWrapper>
			</>
		);
}
