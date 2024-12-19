async function useServerProps(props) {
	try {
		const params = props.params;
		const symbols = Reflect?.ownKeys(params);

		let urlObject;
		for (const key of symbols) {
			const value = params?.[key];
			if (value && value.url && value.url.pathname) {
				urlObject = value.url;
				break;
			}
		}

		return {
			pathname: urlObject?.pathname,
			search: urlObject?.search,
			params: await params,
			searchParams: await props.searchParams,
		};
	} catch (error) {
		return null;
	}
}

export default async function (props) {
	/* 	const { pathname, search, params, searchParams } = await useServerProps(props);
	console.log(pathname, search, params, searchParams); */

	return (
		<>
			{/* 			{pathname}
			 */}
			<iframe
				src="https://shop.medimun.org"
				className="w-full h-screen hidescrollbar"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
		</>
	);
}
