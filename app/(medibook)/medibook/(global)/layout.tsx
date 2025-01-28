export default function Layout({ children }) {
	return (
		<div className="grow relative min-h-max w-auto">
			<div className="p-6 min-h-max flex lg:p-10 h-full flex-col gap-6">{children}</div>
		</div>
	);
}
