import prisma from "@/prisma/client";

import InvoicesPage from "@/global-pages/invoices/page";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { TopBar } from "@/components/top-bar";

export default function Page(props) {
	return (
		<Suspense fallback={<TopBar title="Individual Invoices" buttonText={`Home`} buttonHref={`/medibook`}></TopBar>}>
			<SchoolInvoicesPage {...props} />
		</Suspense>
	);
}

export async function SchoolInvoicesPage({ params, searchParams }) {
	await connection();
	const authSession = await auth();
	const { page } = await searchParams;
	const currentPage = parseInt(page) || 1;
	const query = (await searchParams).search || "";

	if (!authSession) notFound();

	const [invoices, totalItems] = await prisma.$transaction([
		prisma.invoice.findMany({
			where: {
				userId: authSession.user.id,
				OR: [
					{ id: { contains: query, mode: "insensitive" } },
					{ number: parseInt(query) || 0 },
					{ school: { name: { contains: query, mode: "insensitive" } } },
					{ description: { contains: query, mode: "insensitive" } },
				],
			},
			include: { user: true, school: true },
			skip: (currentPage - 1) * 10,
			take: 10,
		}),
		prisma.invoice.count({
			where: {
				userId: authSession.user.id,
			},
		}),
	]);

	return (
		<InvoicesPage
			topbarProps={{
				title: "Individual Invoices",
				buttonText: `Home`,
				buttonHref: `/medibook`,
			}}
			invoices={invoices}
			totalItems={totalItems}
		/>
	);
}
