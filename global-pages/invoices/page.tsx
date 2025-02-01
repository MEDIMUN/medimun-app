import { Badge } from "@/components/badge";
import { Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownMenu } from "@/components/dropdown";
import Paginator from "@/components/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Suspense } from "react";
import { SearchParamsButton, SearchParamsDropDropdownItem, TopBar } from "@/app/(medibook)/medibook/client-components";
import dynamic from "next/dynamic";
import { Ellipsis } from "lucide-react";
import { MainWrapper } from "@/components/main-wrapper";
import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";
import { InvoiceDownloadButton, ReceiptDownloadButton } from "@/global-pages/invoices/client-components";
import { connection } from "next/server";

const PdfDownloadButton = dynamic(() => import("@/global-pages/invoices/client-components").then((mod) => mod.PdfDownloadButton));

export default async function InvoicesPage({ topbarProps, invoices, totalItems, hiddenColumns = [] }) {
	await connection();
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	return (
		<>
			<TopBar hideBackdrop {...topbarProps}>
				{isManagement && <SearchParamsButton searchParams={{ "create-invoice": "true" }}>Create Invoice</SearchParamsButton>}
			</TopBar>
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
													{isManagement && (
														<>
															<SearchParamsDropDropdownItem
																searchParams={{
																	"edit-invoice": invoice.id,
																}}>
																Edit Invoice
															</SearchParamsDropDropdownItem>
															<SearchParamsDropDropdownItem
																searchParams={{
																	"delete-invoice": invoice.id,
																}}>
																Delete Invoice
															</SearchParamsDropDropdownItem>
														</>
													)}
													<DropdownDivider />
													<Suspense fallback={<DropdownItem disabled>Download Invoice</DropdownItem>}>
														<InvoiceDownloadButton invoice={invoice} />
													</Suspense>
													<DropdownDivider />
													{invoice.isPaid && (
														<>
															<Suspense fallback={<DropdownItem disabled>Download Receipt</DropdownItem>}>
																<ReceiptDownloadButton invoice={invoice} />
															</Suspense>
															<DropdownDivider />
														</>
													)}
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
