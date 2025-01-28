export default function Layout({ children }) {
	return (
		<main className="grow p-6 relative lg:p-10">
			<div className="flex h-full flex-col gap-6">{children}</div>
		</main>
	);
}
