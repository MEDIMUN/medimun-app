export function Frame(props) {
	return (
		<div className={`h-[calc(100%-91px)] overflow-y-auto rounded-2xl border-1 border-gray-200 font-[montserrat] ${!props.noPadding && "p-4"}`}>
			{props.topContent}
			{props.isGrid && <div className={`mx-auto grid h-auto max-w-[1200px] grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 ${props.nonEqualY ? "" : "grid-rows-3"}`}>{props.children}</div>}
			{!props.isGrid && props.children}
			{props.isEmpty && (
				<div className="flex h-full justify-center align-middle">
					<p className="m-auto my-auto w-full text-center">{props.emptyContent}</p>
				</div>
			)}
		</div>
	);
}
