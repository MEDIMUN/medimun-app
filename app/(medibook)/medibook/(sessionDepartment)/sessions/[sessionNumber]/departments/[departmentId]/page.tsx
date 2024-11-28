import { TopBar } from "@/app/(medibook)/medibook/client-components";
import { ActionList } from "@/app/components/actions-list";
import { auth } from "@/auth";
import { Badge } from "@/components/badge";
import { authorize, authorizeManagerDepartment, authorizeMemberDepartment, s } from "@/lib/authorize";
import { romanize } from "@/lib/romanize";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";

export default async function Page(props) {
	const authSession = await auth();
	const params = await props.params;
	const selectedDepartment = await prisma.department
		.findFirstOrThrow({
			where: {
				OR: [{ id: params.departmentId }, { slug: params.departmentId }],
				session: { number: params.sessionNumber },
			},
			include: { session: true, manager: { include: { user: true } } },
		})
		.catch(notFound);

	const allRoles = (authSession?.user?.currentRoles || []).concat(authSession?.user?.pastRoles || []);

	const isManagement = authorize(authSession, [s.management]);
	const isManagerOfDepartment = authorizeManagerDepartment(allRoles, selectedDepartment.id);
	const isMemberOfDepartment = authorizeMemberDepartment(allRoles, selectedDepartment.id);
	const isPartOfDepartment = isManagerOfDepartment || isMemberOfDepartment || isManagement;

	const actions = [
		{
			title: "Department Announcements",
			description: "Announcements for the department.",
			href: `/medibook/sessions/${selectedDepartment.session.number}/departments/${selectedDepartment.slug || selectedDepartment.id}/announcements`,
			isVisible: isPartOfDepartment,
		},
		{
			title: "Department Resources",
			description: "Resources for the department.",
			href: `/medibook/sessions/${selectedDepartment.session.number}/departments/${selectedDepartment.slug || selectedDepartment.id}/resources`,
			isVisible: isPartOfDepartment,
		},
		{
			title: "Meet the Managers",
			description: "Meet the managers of the department.",
			href: `/medibook/sessions/${selectedDepartment.session.number}/departments/${selectedDepartment.slug || selectedDepartment.id}/managers`,
			isVisible: true,
		},
		{
			title: "Department Members",
			description: "Members of the department.",
			href: `/medibook/sessions/${selectedDepartment.session.number}/departments/${selectedDepartment.slug || selectedDepartment.id}/members`,
			isVisible: true,
		},
	].filter((a) => a.isVisible);

	return (
		<>
			<TopBar
				title={selectedDepartment.name}
				buttonHref={`/medibook/medibook/sessionDepartment/sessions/${params.sessionNumber}/departments`}
				buttonText={`Session ${romanize(params.sessionNumber)} Departments`}
				hideSearchBar
			/>
			<div className="flex h-[200px] w-full overflow-hidden rounded-xl bg-[url(/assets/medibook-session-welcome.webp)] bg-cover bg-right ring-1 ring-gray-200 md:h-[328px]">
				<div className="mt-auto p-5">
					<p className="font-[canela] text-2xl text-primary md:text-4xl">{selectedDepartment.name}</p>
					{/* 					{selectedDepartment.description && <p className="font-[canela] text-medium text-zinc-700 md:text-2xl">{selectedCommittee.description}</p>}
					 */}
				</div>
			</div>
			<ActionList actions={actions} />
		</>
	);
}
