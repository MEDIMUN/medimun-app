export function getOrdinal(n: number): "st" | "nd" | "rd" | "th" {
	let ord: "st" | "nd" | "rd" | "th" = "th";

	if (n % 10 === 1 && n % 100 !== 11) {
		ord = "st";
	} else if (n % 10 === 2 && n % 100 !== 12) {
		ord = "nd";
	} else if (n % 10 === 3 && n % 100 !== 13) {
		ord = "rd";
	}

	return ord;
}
