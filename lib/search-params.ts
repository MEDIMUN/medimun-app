"use client";

export function removeSearchParams(params: object, router: any = null) {
	try {
		const url = new URL(window.location.href);
		for (const [key, value] of Object.entries(params)) {
			url.searchParams.delete(key);
		}
		if (router) {
			router.push(url.toString(), { scroll: false });
		} else {
			window.history.replaceState({}, "", url.toString());
		}
	} catch (e) {}
}

export function updateSearchParams(params: object, router: any = null) {
	const url = new URL(window.location.href);
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, value);
	}
	if (router) {
		router.push(url.toString(), { scroll: false });
	} else {
		window.history.replaceState({}, "", url.toString());
	}
}
