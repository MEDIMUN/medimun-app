export function parseOrderDirection(str: string, defaultDir?: "asc" | "desc"): "asc" | "desc" | object {
	if (!str) return defaultDir || "asc";
	try {
		const decodedDirection = decodeURIComponent(str);
		try {
			const parsedDirection = JSON.parse(decodedDirection);
			if (typeof parsedDirection === "object" && parsedDirection !== null) return parsedDirection;
		} catch (jsonParseError) {
			if (decodedDirection === "asc" || decodedDirection === "desc") return decodedDirection;
		}
		return "asc";
	} catch (e) {
		return "asc";
	}
}
