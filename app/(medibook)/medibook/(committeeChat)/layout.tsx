export default function Layout({ children }) {
	return (
		<div className="grow h-full flex flex-row overflow-hidden lg:rounded-lg lg:bg-white lg:p-0 lg:shadow-sm lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
			{children}
		</div>
	);
}
