import { SearchParamsDropDropdownItem, TopBar } from "@/app/(medibook)/medibook/client-components";
import Paginator from "@/components/pagination";
import prisma from "@/prisma/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Badge } from "@/components/badge";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import { PDFDownloadLink } from "@alexandernanberg/react-pdf-renderer";
import { MyDocument } from "@/pdf/templates/invoice";
import { PdfDownloadButton } from "./client-components";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Suspense } from "react";
import { authorize, authorizeSchoolDirectorSchool, s } from "@/lib/authorize";
import Link from "next/link";
import { TextLink } from "@/components/text";

export default async function InvoicesPage({ params, searchParams }) {
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

	const subText = (
		<>
			Check out the <TextLink href={`/medibook/sessions/${sessionNumber}/resources`}>Session Resources</TextLink> for payment instructions.
		</>
	);

	return (
		<>
			<TopBar
				subheading={subText}
				buttonText={selectedSchool.name}
				buttonHref={`/medibook/${sessionNumber}/schools/${schoolId}`}
				title="Session Invoices"
				hideSearchBar
			/>
			<Table>
				<TableHead>
					<TableRow>
						<TableHeader>
							<span className="sr-only">Actions</span>
						</TableHeader>
						<TableHeader>Number</TableHeader>
						<TableHeader>Description</TableHeader>
						<TableHeader>Amount</TableHeader>
						<TableHeader>Date Created</TableHeader>
						<TableHeader>Due Date</TableHeader>
						<TableHeader>Status</TableHeader>
					</TableRow>
				</TableHead>
				<TableBody>
					{invoices.map((invoice) => {
						const parsedItems = JSON.parse(invoice.items || "[]") ?? [];
						const total = parsedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
						return (
							<TableRow key={invoice.id}>
								<TableCell>
									<Dropdown>
										<DropdownButton plain aria-label="More options">
											<EllipsisHorizontalIcon />
										</DropdownButton>
										<DropdownMenu className="max-w-max">
											<Suspense fallback={<DropdownItem disabled>Download PDF</DropdownItem>}>
												<PdfDownloadButton invoice={invoice} />
											</Suspense>
											<DropdownItem disabled>Pay with card (Coming in 2025)</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								</TableCell>
								<TableCell>#{invoice.number.toString().padStart(10, "0")}</TableCell>
								<TableCell>{invoice.description}</TableCell>
								<TableCell>€{total ? total.toFixed(2).toString().padStart(4, "0") : "0"}</TableCell>
								<TableCell>{invoice.date.toLocaleDateString("en-GB")}</TableCell>
								<TableCell>{invoice.dueDate?.toLocaleDateString("en-GB") || "-"}</TableCell>
								<TableCell>{invoice.isPaid ? <Badge color="green">Paid</Badge> : <Badge color="red">Not Paid</Badge>}</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
			<Paginator totalItems={totalItems} itemsOnPage={invoices.length} />
		</>
	);
}
