import { userData as userGetter } from "@/lib/user-data";
import prisma from "@/prisma/client";
import { Avatar } from "@nextui-org/avatar";
import { Spacer } from "@nextui-org/spacer";
import ProfileTabs from "./ProfileTabs";
import { Tooltip } from "@nextui-org/tooltip";
import { Button } from "@nextui-org/button";
import Icon from "@/components/icon";
import { Link } from "@nextui-org/link";
import { Badge } from "@nextui-org/badge";
import { EditUserModal } from "./modals";

export default async function Page({ params, searchParams }) {
	const selectedUser = await prisma.user.findFirst({
		where: {
			OR: [
				{
					id: params.userId,
				},
				{
					username: params.userId,
				},
			],
		},
		select: {
			id: true,
		},
	});
	const userData = await userGetter(selectedUser.id);
	let edit = null;
	let schools = [];
	if (searchParams.edit) {
		edit = await prisma.user.findFirst({
			where: {
				id: searchParams.edit,
			},
		});
		schools = await prisma.school.findMany();
	}

	const fullName = userData.user.displayName || `${userData.user.officialName} ${userData.user.officialSurname}`;
	return (
		<>
			<EditUserModal user={edit} schools={schools} />
			<section className="mx-auto flex max-w-5xl flex-col p-4 py-24">
				<div className="mx-auto flex max-w-xl flex-col items-center text-center">
					<Badge
						classNames={{
							badge: "w-4 h-4",
						}}
						content={
							<Tooltip content="Edit Details">
								<Button isIconOnly className="h-10 w-10 min-w-10 -translate-x-1 -translate-y-1 bg-background p-0 text-default-500" radius="full" size="sm" variant="bordered">
									<Icon className="h-[18px] w-[18px]" icon="solar:pen-linear" />
								</Button>
							</Tooltip>
						}
						placement="bottom-right"
						shape="circle">
						<Avatar showFallback className="mx-auto h-40 w-40" isBordered src={`/api/users/${userData.user.id}/avatar`} />
					</Badge>
					<Spacer y={4} />
					<h1 className="text-4xl font-medium tracking-tight">{fullName}</h1>
					{userData?.currentRoleNames[0] && <h2 className="text-large text-default-500">{userData?.currentRoleNames[0]}</h2>}
					<Spacer y={3} />
				</div>
				<ProfileTabs user={userData} />
			</section>
		</>
	);
}
