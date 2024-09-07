"use server";

export async function submitDelegationDeclaration(selectedSchoolId: string, numberOfGADelegations, preferredCountriesArray) {
	console.log({ selectedSchoolId, numberOfGADelegations, preferredCountriesArray });
	return { ok: true, message: "Delegation declaration submitted." };
}
