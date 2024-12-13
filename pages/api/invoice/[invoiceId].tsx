// pages/api/generate-pdf.js

import { MyDocument } from "@/pdf/templates/invoice";
import prisma from "@/prisma/client";
import { Document, Page, renderToStream, Text } from "@react-pdf/renderer";

export default async function handler(req, res) {
	const selectedInvoice = await prisma.invoice
		.findFirstOrThrow({
			where: { OR: [{ id: req.query.invoiceId }, { number: parseInt(req.query.invoiceId) }] },
			include: { user: true, school: true },
		})
		.catch(() => {
			res.status(404).send("Invoice not found");
		});

	try {
		const stream = await renderToStream(<MyDocument invoice={selectedInvoice} />);

		res.setHeader("Content-Type", "application/pdf");
		/* 		res.setHeader("Content-Disposition", 'attachment; filename="react-pdf-nextjs.pdf"');
		 */
		stream.pipe(res);
	} catch (error) {
		res.status(500).send("Error generating PDF");
	}
}
