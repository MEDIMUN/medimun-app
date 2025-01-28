import prisma from "@/prisma/client";
import { authorize, s } from "@/lib/authorize";
import InvoicesPage from "@/global-pages/invoices/page";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { romanize } from "@/lib/romanize";

export default async function SchoolInvoicesPage({ params, searchParams }) {
	const { sessionNumber } = await params;
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	const { page } = await searchParams;
	const currentPage = parseInt(page) || 1;
	const query = (await searchParams).search || "";

	if (!isManagement) notFound();

	const [invoices, totalItems] = await prisma.$transaction([
		prisma.invoice.findMany({
			where: {
				session: { number: sessionNumber },
				OR: [
					{ user: { officialName: { contains: query, mode: "insensitive" } } },
					{ user: { officialSurname: { contains: query, mode: "insensitive" } } },
					{ user: { displayName: { contains: query, mode: "insensitive" } } },
					{ user: { id: { contains: query, mode: "insensitive" } } },
					{ user: { email: { contains: query, mode: "insensitive" } } },
					{ user: { phoneNumber: { contains: query, mode: "insensitive" } } },
					{ id: { contains: query, mode: "insensitive" } },
					{ number: parseInt(query) || 0 },
					{ school: { name: { contains: query, mode: "insensitive" } } },
				],
			},
			include: { user: true, school: true },
			skip: (currentPage - 1) * 10,
			take: 10,
		}),
		prisma.invoice.count({ where: { session: { number: sessionNumber } } }),
	]);

	return (
		<InvoicesPage
			topbarProps={{
				title: "Session Invoices",
				buttonText: `Session ${romanize(sessionNumber)}`,
				buttonHref: `/medibook/sessions/${sessionNumber}`,
			}}
			invoices={invoices}
			totalItems={totalItems}
		/>
	);
}
