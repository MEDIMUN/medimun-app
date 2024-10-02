import Paginator from "@/components/pagination";
import { Suspense } from "react";

export default function Page() {
	return (
		<div className="py-24 sm:py-32">
			<div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
				<div className="mb-4 lg:px-8">
					<div className="mx-auto max-w-2xl text-left md:text-center">
						<h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">The 20th Annual Session</h2>
						<p className="mt-2 text-lg leading-6 text-gray-600 md:mt-3">
							Global Resources and Resources from the latest session.
							<br />
							This section will be made available on the 26th of September, 2024
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
