export default function Layout({ children }) {
	return (
		<div className="grow p-6 lg:rounded-lg min-h-max lg:bg-white lg:p-10 lg:shadow-sm lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
			<div className="mx-auto min-h-max flex max-w-6xl h-full flex-col gap-6">{children}</div>
		</div>
	);
}
