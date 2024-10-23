import { userData as userGetter } from "@/lib/user";
import prisma from "@/prisma/client";
import { Avatar } from "@nextui-org/avatar";
import { Spacer } from "@nextui-org/spacer";
import ProfileTabs from "./ProfileTabs";
import { Tooltip } from "@nextui-org/tooltip";
import { Badge } from "@nextui-org/badge";
import { EditRolesButton } from "./buttons";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/16/solid";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { MenuButton } from "@headlessui/react";
import { Button } from "@/components/button";
import { SearchParamsDropDropdownItem } from "../../../client-components";
import {
	authorize,
	authorizeChairCommittee,
	authorizeChairDelegate,
	authorizeManagerDepartment,
	authorizeManagerMember,
	authorizeSchoolDirectorStudent,
	s,
} from "@/lib/authorize";
import { auth } from "@/auth";

export default async function Page(props) {
    const params = await props.params;
    const authSession = await auth();
    const selectedUser = await prisma.user.findFirst({
		where: { OR: [{ id: params.userId }, { username: params.userId }] },
	});
    const userData = await userGetter(selectedUser.id);
    const fullName = userData?.user.displayName || `${userData?.user.officialName} ${userData?.user.officialSurname}`;
    const randomintegerupto6 = Math.floor(Math.random() * 5) + 1;

    const isChairOfUser = authorizeChairDelegate(authSession.currentRoles, userData.currentRoles);
    const isManagerOfUser = authorizeManagerMember(authSession.currentRoles, userData.currentRoles);
    const isSchoolDirectorOfStudent = authorizeSchoolDirectorStudent(authSession.currentRoles, userData);
    const isManagement = authorize(authSession, [s.management]);
    const isAuthHigherPower = authSession.user.highestRoleRank < userData.highestRoleRank;

    const displayEditRolesButton = isAuthHigherPower && (isManagement || isChairOfUser || isManagerOfUser || isSchoolDirectorOfStudent);

    return (
		<>
			<div>
				<div>
					<img alt="" src={`/assets/gradients/${randomintegerupto6}.jpg`} className="h-32 w-full rounded-2xl object-cover lg:h-48" />
				</div>
				<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
					<div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
						<div className="flex">
							{/* <Badge
								classNames={{ badge: "w-8 h-4" }}
								content={
									<Tooltip content="Edit Details">
										<EditRolesButton userId={userData.user.id} />
									</Tooltip>
								}
								placement="bottom-right"
								shape="circle"> */}
							<Avatar
								showFallback
								className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
								isBordered
								src={`/api/users/${userData.user.id}/avatar`}
							/>
							{/* 							</Badge>
							 */}
						</div>
						<div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
							<div className="mt-6 min-w-0 flex-1 sm:hidden md:block">
								<h1 className="truncate text-2xl font-bold text-gray-900">{fullName}</h1>
								{userData?.currentRoleNames[0] && (
									<h2 className="line-clamp-2 text-large text-default-500 md:-mb-2">{userData?.currentRoleNames[0]}</h2>
								)}
							</div>
							<div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
								{displayEditRolesButton && (
									<Dropdown>
										<DropdownButton
											as={Button}
											color=""
											type="button"
											className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
											<span>Edit User</span>
										</DropdownButton>
										<DropdownMenu>
											<SearchParamsDropDropdownItem searchParams={{ "edit-user": selectedUser.id }}>Edit User</SearchParamsDropDropdownItem>
											<SearchParamsDropDropdownItem searchParams={{ "unafilliate-student": selectedUser.id }}>
												Unafilliate Student
											</SearchParamsDropDropdownItem>
											{isManagement && (
												<SearchParamsDropDropdownItem searchParams={{ "edit-roles": selectedUser.id }}>Edit Roles</SearchParamsDropDropdownItem>
											)}
											{isManagement && (
												<SearchParamsDropDropdownItem searchParams={{ "assign-roles": selectedUser.id }}>Add Roles</SearchParamsDropDropdownItem>
											)}
										</DropdownMenu>
									</Dropdown>
								)}
								<Button
									color=""
									href={`/medibook/messages/${userData.user.id}`}
									type="button"
									className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
									<span>Message</span>
								</Button>
							</div>
						</div>
					</div>
					<div className="mt-6 hidden min-w-0 flex-1 sm:block md:hidden">
						<h1 className="truncate text-2xl font-bold text-gray-900">{fullName}</h1>
					</div>
				</div>
			</div>
			<div className="rounded-lg p-5 text-center">
				<p>{selectedUser.bio}</p>
			</div>
			<section className="mx-auto flex max-w-5xl flex-col p-4">
				<ProfileTabs user={{ ...userData, bio: selectedUser.bio }} />
			</section>
		</>
	);
}
