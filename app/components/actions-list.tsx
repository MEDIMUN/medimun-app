import { Link } from "@/components/link";
import { cn } from "@/lib/cn";

export function ActionList({ actions }) {
	return (
		<div className="divide-y divide-gray-200 dark:divide-gray-800 overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800 ring-1 ring-gray-200 dark:bg-ring-gray-800 sm:grid sm:grid-cols-1 sm:gap-px sm:divide-y-0">
			{actions.map((action, actionIdx) => (
				<div
					key={action.title}
					className={cn(
						actionIdx === 0 ? "rounded-tl-xl rounded-tr-xl sm:rounded-tr-none" : "",
						actionIdx === actions.length - 1 ? "rounded-bl-xl rounded-br-xl sm:rounded-bl-none" : "",
						"group relative bg-white dark:bg-black p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary"
					)}>
					<div>
						<h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
							<Link href={action.href} className="focus:outline-none">
								<span aria-hidden="true" className="absolute inset-0" />
								{action.title}
							</Link>
						</h3>
						<p className="mt-2 text-sm text-gray-500">{action.description}</p>
					</div>
					<span aria-hidden="true" className="pointer-events-none absolute right-6 top-6 text-gray-300 dark:text-gray-700 group-hover:text-gray-400">
						<svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6">
							<path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
						</svg>
					</span>
				</div>
			))}
		</div>
	);
}
