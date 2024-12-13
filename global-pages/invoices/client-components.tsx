"use client";

import { DropdownItem } from "@/components/dropdown";
import { MyDocument } from "@/pdf/templates/invoice";
import { usePDF, PDFDownloadLink } from "@react-pdf/renderer";
import { useEffect, useRef, useState } from "react";

export function PdfDownloadButton({ invoice }) {
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
					Download PDF
				</DropdownItem>
			</>
		);

	if (mounted)
		return (
			<>
				<DropdownItem target="_blank" disabled={instance.loading} {...(instance.url ? { href: instance.url } : {})}>
					{instance.loading ? "Loading Preview..." : "Preview in Browser"}
				</DropdownItem>
				<DropdownItem
					target="_blank"
					disabled={instance.loading}
					{...(instance.url ? { href: instance.url, download: `MEDIMUN-Payment-Notice-#${invoice.number.toString().padStart(10, "0")}` } : {})}>
					{instance.loading ? "Loading Download..." : "Download Printable PDF"}
				</DropdownItem>
			</>
		);

	return <DropdownItem disabled>Loading...</DropdownItem>;
}
