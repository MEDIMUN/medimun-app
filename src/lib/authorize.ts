export enum Scope {
	"Global Admin",
	"Admin",
	"Admins",
	"Senior Director",
	"Director",
	"Board",
	"Secretary-General",
	"Deputy Secretary-General",
	"President of the General Assembly",
	"Deputy President of the General Assembly",
	"Secretariat",
	"Higher Secretariat",
}

//make how do I make it accept an array of Scopes?

export const authorize = (userdata: any, scope: Scope[]) => {
	console.log("run");
	const user = userdata.currentRoleNames;
	let isTrue = false;
	const isTrueArray: any = [];

	// repeat for each scope in the scope array prop
	scope.forEach((scope) => {
		if (user.includes("Global Admin")) return isTrueArray.push(true);
		if (user.includes("Admin")) {
			if (scope === Scope.Admin) return isTrueArray.push(true);
		}
		if (user.includes("Admin") || user.includes("Global Admin")) {
			if (scope === Scope.Admins) return isTrueArray.push(true);
		}
		//ADMINS
		if (user.includes("Senior Director")) {
			if (scope === Scope["Senior Director"]) return isTrueArray.push(true);
		}
		if (user.includes("Director")) {
			if (scope === Scope.Director) return isTrueArray.push(true);
		}
		if (user.includes("Senior Director") || user.includes("Director")) {
			if (scope === Scope.Board) return isTrueArray.push(true);
		}
		//BOARD
		if (user.includes("Secretary-General")) {
			if (scope === Scope["Secretary-General"]) return isTrueArray.push(true);
		}
		if (user.includes("Deputy Secretary-General")) {
			if (scope === Scope["Deputy Secretary-General"]) return isTrueArray.push(true);
		}
		if (user.includes("President of the General Assembly")) {
			if (scope === Scope["President of the General Assembly"]) return isTrueArray.push(true);
		}
		if (user.includes("Deputy President of the General Assembly")) {
			if (scope === Scope["Deputy President of the General Assembly"])
				return isTrueArray.push(true);
		}
		//SECRETARIAT
		if (
			user.includes("Secretary-General") ||
			user.includes("Deputy Secretary-General") ||
			user.includes("President of the General Assembly") ||
			user.includes("Deputy President of the General Assembly")
		) {
			if (scope === Scope.Secretariat) return isTrueArray.push(true);
		}
		if (user.includes("Secretary-General") || user.includes("President of the General Assembly")) {
			if (scope === Scope["Higher Secretariat"]) return isTrueArray.push(true);
		}
		//HIGHER ORGANIZER all roles above managers and chairs, basically all roles written above
		if (
			user.includes("Global Admin") ||
			user.includes("Admin") ||
			user.includes("Senior Director") ||
			user.includes("Director") ||
			user.includes("Secretary-General") ||
			user.includes("Deputy Secretary-General") ||
			user.includes("President of the General Assembly") ||
			user.includes("Deputy President of the General Assembly")
		) {
			if (scope === Scope["Higher Organizer"]) return isTrueArray.push(true);
		}

		return isTrueArray.push(false);
	});
	console.log("isTrueArray");
	console.log(isTrueArray);
	if (isTrueArray.includes(true)) return true;
	return false;
};
