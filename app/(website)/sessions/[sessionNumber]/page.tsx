import Paginator from "@/components/pagination";
import { getOrdinal } from "@/lib/ordinal";
import Link from "next/link";
import { Suspense } from "react";

export default async function Page(props) {
    const params = await props.params;
    return (
		<div className="py-24 sm:py-32">
			<div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
				<div className="mb-4 lg:px-8">
					<div className="mx-auto max-w-2xl text-left md:text-center">
						<h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
							The {params.sessionNumber}
							{getOrdinal(parseInt(params.sessionNumber))} Annual Session
						</h2>
						<p className="mt-2 text-lg leading-6 text-gray-600 md:mt-3">
							Check out our prospectus for more information until this page is updated.
							<br />
							<br />
							<Link href={`/sessions/${params.sessionNumber}/prospectus`} target="_blank" className="text-primary-500 underline">
								Prospectus
							</Link>
							<br />
							<br />
							<Link
								href={`/announcements/XgsyO7enc0QZzp5ZwAn5x/session-20-delegation-application-deadline`}
								target="_blank"
								className="text-primary-500 underline">
								Application Deadlines & Details
							</Link>
						</p>
					</div>
				</div>
				<Suspense fallback={<div>Loading...</div>}>
					<Paginator totalItems={0} itemsOnPage={0} />
				</Suspense>
			</div>
		</div>
	);
}
