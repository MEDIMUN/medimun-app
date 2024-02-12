export function Frame(props) {
	return (
		<div className={`mx-4 h-[calc(100%-91px)] overflow-y-auto font-[montserrat] md:mx-6`}>
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
