export default function Layout({ children, inbox }) {
	return (
		<div className="grow h-screen flex w-full right-0 top-0 absolute flex-row overflow-hidden lg:bg-white lg:p-0 lg:shadow-sm lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
			<div className="hidden md:block">{inbox}</div>
			{children}
		</div>
	);
}
