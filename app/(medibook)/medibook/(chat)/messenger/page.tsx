import InboxesPage from "../inbox-page";
//FIXME:
export default function Messaging() {
	return (
		<>
			<div className="md:hidden w-full block">
				<InboxesPage />
			</div>
			<div className="w-full hidden md:flex bg-zinc-100 dark:bg-zinc-900 p-6 h-full">
				<div className="text-center mx-auto flex flex-col my-auto">
					<svg fill="none" stroke="currentColor" viewBox="0 0 48 48" aria-hidden="true" className="mx-auto size-12 text-gray-400">
						<path
							d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z"
							strokeWidth={2}
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<h2 className="mt-2 text-base font-semibold text-gray-900">Start a conversation</h2>
					<p className="mt-1 text-sm text-gray-500">
						Select a conversation or a group from the left to start messaging.
						<br />
						If you don&apos;t have any, you can create a new one.
					</p>
				</div>
			</div>
		</>
	);
}
