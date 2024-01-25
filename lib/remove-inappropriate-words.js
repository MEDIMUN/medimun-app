export default function CapitaliseEachWord(string) {
	return string
		.toLowerCase()
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

const dirtyWords = ["fuck", "porn", "orospu", "yarrak", "yarrag", "dick", "sex", "blowjob", "naked", "nude", "penis", "malaka", "sikis", "sikiş", "pezeve", "medimun"];

function removeDirtyWords(string, disallowedCharacters = []) {
	
	let lowerCase = string.toLowerCase();
	const characters = [...dirtyWords, ...disallowedCharacters];
	characters.forEach((dirtyWord) => {
		lowerCase = lowerCase.split(dirtyWord).join("");
	});
	return lowerCase;
}

export function capitaliseEachWord(string, length = 0, disallowedCharacters = []) {
	if (length == 0) {
		return removeDirtyWords(string, disallowedCharacters)
			.trimStart()
			.toLowerCase()
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ")
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join("-")
			.split("  ")
			.join(" ");
	}
	return removeDirtyWords(string, disallowedCharacters)
		.trimStart()
		.toLowerCase()
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ")
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join("-")
		.split("  ")
		.join(" ")
		.substring(0, length);
}
