export function nameCase(name: string): string {
	// First, remove characters not allowed, while keeping spaces, hyphens, and apostrophes
	name = name.replace(/[^a-zA-Z\-\s']/g, "");

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
