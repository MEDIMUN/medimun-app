import prisma from "@/prisma/client";

import { authorize, authorizeSchoolDirectorSchool, s } from "@/lib/authorize";
import { TextLink } from "@/components/text";
import InvoicesPage from "@/global-pages/invoices/page";
import { auth } from "@/auth";
import { notFound } from "next/navigation";

export default async function SchoolInvoicesPage({ params, searchParams }) {
	const { sessionNumber, schoolId } = await params;
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	const { page } = await searchParams;
	const currentPage = parseInt(page) || 1;

	const selectedSchool = await prisma.school.findFirst({
		where: { OR: [{ id: schoolId }, { slug: schoolId }] },
	});

	if (!selectedSchool) notFound();

	const isDirectorOfSchool = authorizeSchoolDirectorSchool(authSession?.user.currentRoles, selectedSchool.id);

	if (!isManagement && !isDirectorOfSchool) notFound();

	const [invoices, totalItems] = await prisma.$transaction([
		prisma.invoice.findMany({
			where: { session: { number: sessionNumber }, schoolId: selectedSchool.id },
			include: { school: true, user: true },
			skip: (currentPage - 1) * 10,
			take: 10,
		}),
		prisma.invoice.count({ where: { session: { number: sessionNumber }, schoolId: selectedSchool.id } }),
	]);

	return (
		<InvoicesPage
			topbarProps={{
				title: "School Session Invoices",
				buttonText: selectedSchool.name,
				buttonHref: `/medibook/schools/${schoolId}`,
				hideSearchBar: true,
			}}
			hiddenColumns={["issuedTo"]}
			invoices={invoices}
			totalItems={totalItems}
		/>
	);
}
