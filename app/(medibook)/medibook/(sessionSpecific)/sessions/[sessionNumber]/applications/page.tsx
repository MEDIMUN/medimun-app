import { TopBar } from "@/app/(medibook)/medibook/client-components";
import { cn } from "@/lib/cn";
import { romanize } from "@/lib/romanize";
import prisma from "@/prisma/client";
import Link from "next/link";

export default async function Page(props) {
	const params = await props.params;
	const selectedSession = await prisma.session.findFirst({
		where: { number: params.sessionNumber },
	});

	const actions = [
		{
			title: "Schools Application Status",
			description: "View the status of all school applications",
			href: `/medibook/sessions/${selectedSession.number}/applications/status`,
		},
		{
			title: "School Director Applications",
			description: "Applications for the position of School Director.",
			href: `/medibook/sessions/${selectedSession.number}/applications/school-director`,
		},
		{
			title: "Delegation Applications",
			description: "Applications for the delegation.",
			href: `/medibook/sessions/${selectedSession.number}/applications/delegation`,
		},
		{
			title: "Delegate Assignments",
			description: "Assign delegates to their respective committees",
			href: `/medibook/sessions/${selectedSession.number}/applications/assignment`,
		},
		{
			title: "Chair Applications",
			description: "Applications for the position of Chair.",
			href: `/medibook/sessions/${selectedSession.number}/applications/chair`,
		},
		{
			title: "Manager Applications",
			description: "Applications for the position of Manager",
			href: `/medibook/sessions/${selectedSession.number}/applications/manager`,
		},
		{
			title: "Member Applications",
			description: "Applications for the position of Member",
			href: `/medibook/sessions/${selectedSession.number}/applications/member`,
		},
	];

	return (
		<>
			<TopBar
				hideBackdrop
				buttonText={`Session ${romanize(selectedSession.numberInteger)}`}
				buttonHref={`/medibook/sessions/${selectedSession.number}`}
				hideSearchBar
				title="Session Applications"
			/>
			<div className="divide-y divide-gray-200 overflow-hidden rounded-md bg-gray-200 ring-1 ring-gray-200 sm:grid sm:grid-cols-1 sm:gap-px sm:divide-y-0">
				{actions.map((action, actionIdx) => (
					<div
						key={action.title}
						className={cn(
							actionIdx === 0 ? "rounded-tl-md rounded-tr-md sm:rounded-tr-none" : "",
							actionIdx === actions.length - 1 ? "rounded-bl-md rounded-br-md sm:rounded-bl-none" : "",
							"group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary"
						)}>
						<div>
							<h3 className="text-base font-semibold leading-6 text-gray-900">
								<Link href={action.href} className="focus:outline-none">
									{/* Extend touch target to entire panel */}
									<span aria-hidden="true" className="absolute inset-0" />
									{action.title}
								</Link>
							</h3>
							<p className="mt-2 text-sm text-gray-500">{action.description}</p>
						</div>
						<span aria-hidden="true" className="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400">
							<svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6">
								<path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
							</svg>
						</span>
					</div>
				))}
			</div>
		</>
	);
}
