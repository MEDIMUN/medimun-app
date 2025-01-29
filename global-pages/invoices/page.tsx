import { Badge } from "@/components/badge";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import Paginator from "@/components/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Suspense } from "react";
import { TopBar } from "@/app/(medibook)/medibook/client-components";
import dynamic from "next/dynamic";
import { Ellipsis } from "lucide-react";
import { MainWrapper } from "@/components/main-wrapper";

const PdfDownloadButton = dynamic(() => import("@/global-pages/invoices/client-components").then((mod) => mod.PdfDownloadButton));

export default async function InvoicesPage({ topbarProps, invoices, totalItems, hiddenColumns = [] }) {
	return (
		<>
			<TopBar hideBackdrop {...topbarProps} />
			<MainWrapper>
				{!!invoices.length && (
					<Table>
						<TableHead>
							<TableRow>
								<TableHeader>
									<span className="sr-only">Actions</span>
								</TableHeader>
								<TableHeader>Number</TableHeader>
								{!hiddenColumns.includes("issuedTo") && <TableHeader>Issued To</TableHeader>}
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
													<Ellipsis />
												</DropdownButton>
												<DropdownMenu className="max-w-max">
													<Suspense fallback={<DropdownItem disabled>Download PDF</DropdownItem>}>
														<PdfDownloadButton invoice={invoice} />
													</Suspense>
													<DropdownItem href={`https://www.jccsmart.com/businesses/26057042/pay/10808`} target="_blank">
														Pay with JCC Smart
													</DropdownItem>
													<DropdownItem disabled>Pay by card (Coming Soon)</DropdownItem>
												</DropdownMenu>
											</Dropdown>
										</TableCell>
										<TableCell>#{invoice.number.toString().padStart(10, "0")}</TableCell>
										{!hiddenColumns.includes("issuedTo") && (
											<TableCell>
												{invoice?.user ? `${invoice?.user.officialName} ${invoice?.user.officialName}` : invoice?.school?.name || "-"}
											</TableCell>
										)}
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
				)}
				<Paginator totalItems={totalItems} itemsOnPage={invoices.length} />
			</MainWrapper>
		</>
	);
}
