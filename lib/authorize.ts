export enum s {
	globalAdmin = "Global Admin",
	admin = "Admin",
	admins = "Admins",
	sd = "Senior Director",
	director = "Director",
	board = "Board",
	sg = "Secretary-General",
	dsg = "Deputy Secretary-General",
	pga = "President of the General Assembly",
	dpga = "Deputy President of the General Assembly",
	sec = "Secretariat",
	highsec = "Higher Secretariat",
	management = "Management",
	all = "Everyone",
}

export const authorize = (userdata: any, scope: s[], status: any) => {
	const user = userdata.currentRoleNames;
	if (userdata.isDisabled) return false;
	if (!userdata) return false;
	if (!scope[0]) return true;
	if (user.includes("Global Admin") || user.includes("Everyone")) return true;
	const isTrueArray: any = [];

	scope.forEach((scope) => {
		if (user.includes("Global Admin")) return isTrueArray.push(true);
		if (user.includes("Admin")) {
			if (scope === s.admin) return isTrueArray.push(true);
		}
		if (user.includes("Admin") || user.includes("Global Admin")) {
			if (scope === s.admins) return isTrueArray.push(true);
		}
		if (user.includes("Senior Director")) {
			if (scope === s.sd) return isTrueArray.push(true);
		}
		if (user.includes("Director")) {
			if (scope === s.director) return isTrueArray.push(true);
		}
		if (user.includes("Senior Director") || user.includes("Director")) {
			if (scope === s.board) return isTrueArray.push(true);
		}
		if (user.includes("Secretary-General")) {
			if (scope === s.sg) return isTrueArray.push(true);
		}
		if (user.includes("Deputy Secretary-General")) {
			if (scope === s.dsg) return isTrueArray.push(true);
		}
		if (user.includes("President of the General Assembly")) {
			if (scope === s.pga) return isTrueArray.push(true);
		}
		if (user.includes("Deputy President of the General Assembly")) {
			if (scope === s.dpga) return isTrueArray.push(true);
		}
		if (
			user.includes("Secretary-General") ||
			user.includes("Deputy Secretary-General") ||
			user.includes("President of the General Assembly") ||
			user.includes("Deputy President of the General Assembly")
		) {
			if (scope === s.sec) return isTrueArray.push(true);
		}
		if (user.includes("Secretary-General") || user.includes("President of the General Assembly")) {
			if (scope === s.highsec) return isTrueArray.push(true);
		}
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
			if (scope === s.management) return isTrueArray.push(true);
		}

		return isTrueArray.push(false);
	});
	if (isTrueArray.includes(true)) return true;
	return false;
};
