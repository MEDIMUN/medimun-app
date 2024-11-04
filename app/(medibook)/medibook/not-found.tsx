export default async function Page() {
	return (
		<div className="grow p-6 lg:rounded-lg min-h-max -mb-[6px] lg:bg-white lg:p-10 lg:shadow-sm lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
			<div className="mx-auto min-h-max flex max-w-6xl h-full  flex-col gap-6">
				<div className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
					<div className="text-center">
						<p className="text-base font-semibold text-primary">404</p>
						<h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Not Found</h1>
						<div className="mt-10 flex items-center justify-center gap-x-6">
							<a
								href="/medibook"
								className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
								Go back home
							</a>
							<a href="/contact" className="text-sm font-semibold text-gray-900">
								Contact support <span aria-hidden="true">&rarr;</span>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
