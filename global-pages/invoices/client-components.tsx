"use client";

import { DropdownItem } from "@/components/dropdown";
import { MyDocument } from "@/pdf/templates/invoice";
import { Receipt } from "@/pdf/templates/receipt";

import { usePDF, PDFDownloadLink } from "@react-pdf/renderer";
import { useEffect, useRef, useState } from "react";

export function InvoiceDownloadButton({ invoice }) {
	const [instance] = usePDF({ document: <MyDocument invoice={invoice} /> });
	const [mounted, setMounted] = useState(false);
	const downloadRef = useRef(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (instance.error)
		return (
			<>
				<PDFDownloadLink className="hidden" ref={downloadRef} document={<MyDocument invoice={invoice} />} />
				<DropdownItem
					onClick={() => {
						downloadRef?.current?.click();
					}}>
					Download Invoice
				</DropdownItem>
			</>
		);

	if (mounted)
		return (
			<>
				<DropdownItem target="_blank" disabled={instance.loading} {...(instance.url ? { href: instance.url } : {})}>
					{instance.loading ? "Loading Invoice..." : "Preview Invoice"}
				</DropdownItem>
				<DropdownItem
					target="_blank"
					disabled={instance.loading}
					{...(instance.url ? { href: instance.url, download: `MEDIMUN-Invoice-#${invoice.number.toString().padStart(10, "0")}` } : {})}>
					{instance.loading ? "Loading Invoice..." : "Download Invoice"}
				</DropdownItem>
			</>
		);

	return <DropdownItem disabled>Loading...</DropdownItem>;
}

export function ReceiptDownloadButton({ invoice }) {
	const [instance] = usePDF({ document: <Receipt invoice={invoice} /> });
	const [mounted, setMounted] = useState(false);
	const downloadRef = useRef(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (instance.error)
		return (
			<>
				<PDFDownloadLink className="hidden" ref={downloadRef} document={<Receipt invoice={invoice} />} />
				<DropdownItem
					onClick={() => {
						downloadRef?.current?.click();
					}}>
					Download PDF
				</DropdownItem>
			</>
		);

	if (mounted)
		return (
			<>
				<DropdownItem target="_blank" disabled={instance.loading} {...(instance.url ? { href: instance.url } : {})}>
					{instance.loading ? "Loading Receipt..." : "Preview Receipt"}
				</DropdownItem>
				<DropdownItem
					target="_blank"
					disabled={instance.loading}
					{...(instance.url ? { href: instance.url, download: `MEDIMUN-Receipt-#${invoice.number.toString().padStart(10, "0")}` } : {})}>
					{instance.loading ? "Loading Receipt..." : "Download Receipt"}
				</DropdownItem>
			</>
		);

	return <DropdownItem disabled>Loading...</DropdownItem>;
}
