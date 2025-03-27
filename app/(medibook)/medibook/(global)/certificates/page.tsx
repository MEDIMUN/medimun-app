import { auth } from "@/auth";
import { TopBar } from "../../client-components";
import { parseOrderDirection } from "@/lib/order-direction";
import prisma from "@/prisma/client";
import { Suspense } from "react";
import { LoadingTable } from "@/app/components/loading-table";
import { MainWrapper } from "@/components/main-wrapper";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { getOrdinal } from "@/lib/get-ordinal";
import Paginator from "@/components/pagination";
import { Button } from "@/components/button";
import { DownloadButton } from "@/components/ui/download-button";
import { romanize } from "@/lib/romanize";
import { Download, Eye } from "lucide-react";
import { Metadata } from "next";

const itemsPerPage = 10;

export const metadata: Metadata = {
	title: "Certificates & Awards",
	description: "View and download your certificates and awards.",
};

export async function TableOfContents({ props }) {
	await connection();
	const authSession = await auth();
	if (!authSession) notFound();
	const searchParams = await props.searchParams;
	const params = await props.params;
	const currentPage = Number(searchParams.page) || 1;
	const query = searchParams.search || "";
	const orderBy = searchParams.order || "name";
	const orderDirection = parseOrderDirection(searchParams.direction);
	const whereObject = { user: { id: authSession.user.id }, session: { publishCertificates: true, number: { contains: query } } };

	const participationCertificates = await prisma.participationCertificate.findMany({
		where: whereObject,
		take: itemsPerPage,
		include: {
			session: {
				include: {
					Day: {
						take: 1,
						orderBy: [{ date: "desc" }],
					},
				},
			},
		},
		skip: (currentPage - 1) * itemsPerPage,
		orderBy: [{ session: { numberInteger: "desc" } }],
	});

	const totalItems = await prisma.resource.count({ where: whereObject });

	return (
		<>
			{!!participationCertificates.length && (
				<Table>
					<TableHead>
						<TableRow>
							<TableHeader>
								<span className="sr-only">Actions</span>
							</TableHeader>
							<TableHeader>Type</TableHeader>
							<TableHeader>Conference Session</TableHeader>
							<TableHeader>Year</TableHeader>
							<TableHeader>Certificate ID</TableHeader>
						</TableRow>
					</TableHead>
					<TableBody>
						{participationCertificates.map((certificate) => (
							<TableRow key={certificate.id}>
								<TableCell className="!max-w-max">
									<div className="flex space-x-2 max-w-max">
										<Button href={`/medibook/certificates/${certificate.id}`} plain>
											<Eye /> View
										</Button>
										<DownloadButton
											href={`/api/certificates/${certificate.id}?download=true`}
											filename={`${authSession.user.officialName} ${authSession.user.officialSurname} | MEDIMUN ${romanize(certificate.session.numberInteger)} (${certificate.id})`}
											plain>
											<Download /> Download
										</DownloadButton>
									</div>
								</TableCell>

								<TableCell className="font-medium">Certificate of Participation</TableCell>
								<TableCell>
									{certificate.session.number}
									<sup>{getOrdinal(certificate.session.numberInteger)}</sup> Annual Session
								</TableCell>
								<TableCell>{certificate?.session?.Day[0]?.date?.getFullYear() || "N/A"}</TableCell>

								<TableCell className="w-full">{certificate.id}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
			<Paginator totalItems={totalItems} itemsPerPage={itemsPerPage} itemsOnPage={participationCertificates.length} />
		</>
	);
}

export default function Page(props) {
	return (
		<>
			<TopBar searchText="Search session..." buttonHref="/medibook" buttonText="Home" title="Certificates & Awards" />
			<MainWrapper>
				<Suspense fallback={<LoadingTable columns={["Type", "Conference Session", "Year", "Certificate Identifier"]} />}>
					<TableOfContents props={props} />
				</Suspense>
			</MainWrapper>
		</>
	);
}
