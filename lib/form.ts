export function parseFormData(formData: FormData): Object {
	const rawData = Object.fromEntries(formData);
	const data = Object.keys(rawData).reduce((acc, key) => {
		const value = rawData[key];
		if (value === "null") {
			acc[key] = null;
		} else if (value === "undefined") {
			acc[key] = undefined;
		} else if (value === "true") {
			acc[key] = true;
		} else if (value === "false") {
			acc[key] = false;
		} else if (value === "") {
			acc[key] = null;
		} else if (typeof value === "string") {
			acc[key] = value.trim();
		} else {
			acc[key] = value;
		}
		return acc;
	}, {}) as any;
	return data;
}
