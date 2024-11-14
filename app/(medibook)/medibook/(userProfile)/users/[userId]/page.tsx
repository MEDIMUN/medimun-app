import { userData as userGetter } from "@/lib/user";
import prisma from "@/prisma/client";
import { Avatar } from "@nextui-org/avatar";
import ProfileTabs from "./ProfileTabs";
import { Dropdown, DropdownButton, DropdownMenu } from "@/components/dropdown";
import { Button } from "@/components/button";
import { SearchParamsDropDropdownItem, TopBar } from "../../../client-components";
import { authorize, authorizeChairDelegate, authorizeManagerMember, authorizeSchoolDirectorStudent, s } from "@/lib/authorize";
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
		<div className="grow h-full overflow-scroll lg:rounded-lg lg:bg-white lg:p-0 lg:shadow-sm lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
			<TopBar
				hideBackdrop
				hideSearchBar
				buttonHref={isManagement ? "/medibook/users" : "/mediboook"}
				className="absolute p-5 !text-white"
				buttonText={isManagement ? "All Users" : "Home"}
			/>
			<div>
				<div>
					<img alt="" src={`/assets/gradients/${2}.jpg`} className="h-48 w-full object-cover lg:h-56" />
				</div>
				<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
					<div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
						<div className="flex">
							<Avatar
								showFallback
								className="h-24 w-24 rounded-xl ring-4 ring-white sm:h-32 sm:w-32"
								isBordered
								src={`/api/users/${userData.user.id}/avatar`}
							/>
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
									href={`/medibook/messenger/@${userData.user.username || userData.user.id}?new=true`}
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
			<div className="flex m-4 md:m-8 flex-1 h-full b flex-col">
				<div className="w-full h-full flex-1 bg-zinc-100 rounded-xl mx-auto">
					<section className="mx-auto mb-auto h-full flex max-w-5xl flex-col p-4">
						<div className="rounded-lg font-[montserrat] p-5 text-left md:text-center">
							<p>{selectedUser.bio}</p>
						</div>
						<ProfileTabs user={{ ...userData, bio: selectedUser.bio }} />
					</section>
				</div>
			</div>
		</div>
	);
}
