import prisma from "@/prisma/client";
import { ModalCreateInvoice, ModalDeleteInvoice, ModalEditInvoice } from "./modals";
import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";
import { Prisma } from "@prisma/client";

export type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
	include: {
		session: true;
		school: true;
		user: true;
	};
}>;

export interface InvoiceItem {
	description: string;
	price: number;
	quantity: number;
	lockDescription?: boolean;
	lockAmount?: boolean;
	lockQuantity?: boolean;
}

export const sortItems = (itemsToSort: InvoiceItem[]) => {
	return itemsToSort.sort((a, b) => a.description.localeCompare(b.description));
};

export default async function Modals(props) {
	const searchParams = await props.searchParams;
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);

	if (!isManagement) return null;

	let editInvoice: InvoiceWithRelations | null = null;
	if (searchParams["edit-invoice"]) {
		try {
			editInvoice = await prisma.invoice.findFirstOrThrow({
				where: { id: searchParams["edit-invoice"] },
				include: {
					session: true,
					school: true,
					user: true,
				},
			});
		} catch (e) {
			editInvoice = null;
		}
	}

	if (searchParams["delete-invoice"]) {
		try {
			editInvoice = await prisma.invoice.findFirstOrThrow({
				where: { id: searchParams["delete-invoice"] },
				include: {
					session: true,
					school: true,
					user: true,
				},
			});
		} catch (e) {
			editInvoice = null;
		}
	}

	if (searchParams["create-invoice"] == "true") {
		return <ModalCreateInvoice />;
	}

	return (
		<>
			{editInvoice && (
				<>
					<ModalDeleteInvoice selectedInvoice={editInvoice} />
					<ModalEditInvoice selectedInvoice={editInvoice} />
				</>
			)}
		</>
	);
}
