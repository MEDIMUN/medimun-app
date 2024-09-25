const hashPassword = require("bcryptjs").hash;

const password = "Berzan06!";

async function main() {
	console.log(await hashPassword(password, 12));
}

main();
