export function debounce<F extends (...args: any[]) => any>(func: F, wait: number): F {
	let timeout: ReturnType<typeof setTimeout> | null = null;
	return function (this: any, ...args: Parameters<F>) {
		if (timeout !== null) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => func.apply(this, args), wait);
	} as F;
}
