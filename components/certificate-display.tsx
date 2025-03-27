"use client";

import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { Document, Page } from "react-pdf";
import { arrayFromNumber } from "@/lib/array-from-number";
import { useRef, useState, useEffect } from "react";
import Paginator from "@/components/pagination";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { MessageCircleWarningIcon } from "lucide-react";
import { forceDownloadFile } from "@/app/(website)/sessions/[sessionNumber]/albums/utils/downloadPhoto";
import { useWidth } from "@/hooks/use-width";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();

export function CertificateDisplay({ certificateId, isVoid = false, voidMessage = null }: { certificateId: string; isVoid?: boolean; voidMessage?: string | null }) {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (isMounted) {
		return <CertificateDisplayMain certificateId={certificateId} isVoid={isVoid} voidMessage={voidMessage} />;
	}
}

export function CertificateDisplayMain({ certificateId, isVoid = false, voidMessage = null }: { certificateId: string; isVoid?: boolean; voidMessage?: string | null }) {
	const [numPages, setNumPages] = useState<number>();
	const [isMounted, setIsMounted] = useState(false);
	const wrapperDiv = useRef(null);

	const { width } = useWidth(wrapperDiv, isMounted);

	function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
		setNumPages(numPages);
	}

	return (
		<div className="wrapper" ref={wrapperDiv}>
			<Document
				loading={<Paginator totalItems={0} itemsOnPage={0} customText={`Loading certificate ${certificateId}`} />}
				file={`/api/certificates/${certificateId}`}
				className="mx-auto flex-col align-middle w-full justify-center"
				onLoadSuccess={onDocumentLoadSuccess}>
				{!isVoid ? (
					<Carousel
						className="mb-6"
						plugins={[
							Autoplay({
								delay: 5000,
							}),
						]}>
						<CarouselContent>
							{arrayFromNumber(numPages).map((_, index) => (
								<CarouselItem key={index}>
									<div className="w-full mx-auto shadow-xl flex-1">
										<Page width={width || 300} className="w-full mx-auto rounded-lg overflow-hidden" pageNumber={index + 1} />
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
						{numPages !== 1 && (
							<Carousel>
								{
									<div className="absolute top-[100%] flex translate-y-6 items-center justify-center">
										<CarouselPrevious className="relative rounded-lg left-0 translate-x-0 hover:translate-x-0 hover:bg-primary/90" />
									</div>
								}
								<div className="absolute top-[100%] left-10 translate-y-6 flex items-center justify-center">
									<CarouselNext className="relative right-0 rounded-lg translate-x-0 hover:translate-x-0 hover:bg-primary/90" />
								</div>
							</Carousel>
						)}
					</Carousel>
				) : (
					<div className="rounded-md bg-yellow-100 p-4">
						<div className="flex">
							<div className="shrink-0">
								<MessageCircleWarningIcon aria-hidden="true" className="size-5 text-yellow-400" />
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-yellow-800">This certificate has been voided.</h3>
								<div className="mt-2 text-sm text-yellow-700">
									<p>
										This may be due to disciplinary matters, breaches of the Code of Conduct or other policies, mistaken issuance, or other reasons at our discretion.
										<br />
										We are not obligated to disclose the specific grounds for this decision, though a reason may be provided below.
									</p>
								</div>
								{voidMessage && (
									<div className="mt-2 text-sm text-yellow-700">
										<p>{voidMessage}</p>
									</div>
								)}
								<div className="mt-4">
									<div className="-mx-2 -my-1.5 flex">
										<button
											onClick={() => forceDownloadFile(`/api/certificates/${certificateId}`, `Notice ${certificateId}.pdf`)}
											type="button"
											className="rounded-md bg-yellow-100 px-2 py-1.5 text-sm font-medium text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-100">
											Download notice
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</Document>
		</div>
	);
}
