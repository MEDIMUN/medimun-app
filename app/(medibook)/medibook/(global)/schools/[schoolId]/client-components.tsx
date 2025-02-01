"use client";

import { useSidebarContext } from "../../../providers";
import { ActionList } from "@/app/components/actions-list";

export function SchoolSessionActionsList({ isManagementOrDirector, school }) {
	const { selectedSession } = useSidebarContext();

	const actions = [
		{
			title: "School Students",
			description: "View all students in this school",
			href: `/medibook/schools/${school.slug || school.id}/students`,
			isVisible: isManagementOrDirector,
		},
		{
			title: "Delegation",
			description: "Manage applications and delegations",
			href: `/medibook/sessions/${selectedSession}/schools/${school.slug || school.id}/delegation`,
			isVisible: isManagementOrDirector,
		},
		{
			title: "Invoices",
			description: "View all invoices for this school",
			href: `/medibook/sessions/${selectedSession}/schools/${school.slug || school.id}/invoices`,
			isVisible: isManagementOrDirector,
		},
	].filter((action) => action.isVisible);

	return <ActionList actions={actions} />;
}
