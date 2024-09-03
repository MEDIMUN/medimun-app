import { userData as userGetter } from "@/lib/user";
import prisma from "@/prisma/client";
import { Avatar } from "@nextui-org/avatar";
import { Spacer } from "@nextui-org/spacer";
import ProfileTabs from "./ProfileTabs";
import { Tooltip } from "@nextui-org/tooltip";
import { Badge } from "@nextui-org/badge";
import { EditRolesButton } from "./buttons";

export default async function Page({ params }) {
	const selectedUser = await prisma.user.findFirst({
		where: { OR: [{ id: params.userId }, { username: params.userId }] },
		select: { id: true },
	});
	const userData = await userGetter(selectedUser.id);
	const fullName = userData?.user.displayName || `${userData?.user.officialName} ${userData?.user.officialSurname}`;

	return (
		<>
			<section className="mx-auto flex max-w-5xl flex-col p-4 py-24">
				<div className="mx-auto flex max-w-xl flex-col items-center text-center">
					<Badge
						classNames={{ badge: "w-8 h-4" }}
						content={
							<Tooltip content="Edit Details">
								<EditRolesButton userId={userData.user.id} />
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
