const hashPassword = require("bcryptjs").hash;

const password = "xnXaEYPcL5z9wnCu";

async function main() {
	console.log(await hashPassword(password, 12));
}

main();
