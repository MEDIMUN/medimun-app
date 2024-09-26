export function nameCase(name: string): string {
	// First, remove characters not allowed, while keeping spaces, hyphens, apostrophes, and ampersands
	name = name.replace(/[^a-zA-Z0-9üşöçı\-\s']/g, "");

	// Capitalize the first letter of each part of the name and handle special characters
	return name
		.split(/\s+/)
		.map((word) =>
			word
				.split(/(-|')/)
				.map((part) => {
					// Return delimiters (- and ') as is
					if (part === "-" || part === "'") {
						return part;
					}
					// Capitalize the first letter of each part and make the rest lowercase
					return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
				})
				.join("")
		)
		.join(" ");
}

export function entityCase(name: string): string {
	name = name.replace(/[^a-zA-Z0-9\-\s'.&]/g, "");
	name = name.replace(/\s+/g, " ");
	name = name
		.split(/\s+/)
		.map((word) =>
			word
				.split(/(-|')/)
				.map((part) => {
					if (part === "-" || part === "'") {
						return part;
					}
					return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
				})
				.join("")
		)
		.join(" ");
	const lowerCaseWords = ["of", "the", "and", "in", "at", "on", "to", "for", "with", "as", "by", "from", "a"];
	const words = name.split(" ");
	for (let i = 0; i < words.length; i++) {
		if (lowerCaseWords.includes(words[i].toLowerCase())) {
			words[i] = words[i].toLowerCase();
		}
	}
	name = words.join(" ");
	//make first letter capital
	name = name.charAt(0).toUpperCase() + name.slice(1);
	//lowercase letters after hyphens, apostrophes, and ampersands
	name = name.replace(/(-|'|&)\w/g, (match) => match.toLowerCase());
	return name;
}

export function capitalize(name: string): string {
	// First, remove characters not allowed, while keeping spaces, hyphens, and apostrophes
	name = name.replace(/[^a-zA-Z0-9\-\s']/g, "");

	// Capitalize the first letter of each part of the name and handle special characters
	return name
		.split(/\s+/)
		.map((word) =>
			word
				.split(/(-|')/)
				.map((part) => {
					// Return delimiters (- and ') as is
					if (part === "-" || part === "'") {
						return part;
					}
					// Capitalize the first letter of each part and make the rest lowercase
					return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
				})
				.join("")
		)
		.join(" ");
}

export function postProcessUsername(username: string): string {
	if (!username) return null;
	// Remove all spaces
	username = username.replace(/\s+/g, "");

	// Remove all characters except _, a-z, and 0-9
	username = username.replace(/[^a-z0-9_]/gi, "");

	// Replace multiple underscores with a single underscore
	username = username.replace(/_+/g, "_");

	// Remove leading and trailing underscores
	username = username.replace(/^_+|_+$/g, "");

	return username;
}

export function processSlug(string: string): string {
	if (!string) return null;
	// Remove all double spaces
	string = string.replace(/\s+/g, " ");

	//replace all spaces with -

	string = string.replace(/\s+/g, "-");

	// Remove all characters except a-z 0-9 and -
	string = string.replace(/[^a-z0-9-]/gi, "");

	// Remove leading and trailing underscores
	string = string.replace(/^-+|-+$/g, "");

	return string;
}

export function processPronouns(pronouns: string): string {
	if (!pronouns) return null;
	pronouns = pronouns?.toLowerCase()?.trim()?.replace(" ", "");
	pronouns = pronouns?.replace(/[^a-z\s\/]/gi, "");

	let pronounsArray = pronouns.split("/").map((pronoun) => {
		let pronouns = pronoun.trim().charAt(0).toUpperCase() + pronoun.trim().slice(1);
		if (pronouns.length > 5) {
			pronouns = pronouns.slice(0, 5);
		}
		return pronouns;
	});

	if (pronounsArray.length > 3) {
		pronounsArray = pronounsArray.slice(0, 3);
	}

	return pronounsArray.join("/");
}

export function capitaliseEachWord(str: String): String {
	return str
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

export function processMarkdownPreview(markdown: string): string {
	if (!markdown) return null;
	//get first 250 characters
	markdown = markdown.trim().slice(0, 350);

	markdown = markdown.replace(/\s+/g, " ");

	//replace line breaks with spaces

	markdown = markdown.replace(/\n/g, " ");

	// Remove all characters except a-z 0-9 and -
	markdown = markdown.replace(/[^a-zA-Z0-9 ]/gi, "᧢");

	//replace all multiple @s with a single @

	markdown = markdown.replace(/᧢+/g, "");

	//replace all @ with spaces

	markdown = markdown.replace(/᧢/g, " ");

	// Remove leading and trailing underscores
	markdown = markdown.replace(/^-+|-+$/g, "");

	return markdown;
}
