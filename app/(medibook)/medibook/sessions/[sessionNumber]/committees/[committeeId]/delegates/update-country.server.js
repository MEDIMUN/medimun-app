"use server";

import "server-only";
import prisma from "@/prisma/client";

export async function updateDelegateCountry ( delegateId, countryCode ) {
	await prisma.delegate.update( {
		where: {
			id: delegateId,
		},
		data: {
			country: countryCode,
		},
	} ).catch( ( e ) => {
		return { ok: false, error: "Internal server error", title: "Internal server error", description: "An error occurred while updating the delegate", variant: "destructive" };
	} );
	await new Promise( ( resolve ) => setTimeout( resolve, 3000 ) );
	return { ok: true, title: `The country has been ${ countryCode ? `updated to ${ countryCode }` : "removed" }`, description: `Changes will be reflected across MEDIMUN platforms within a few minutes`, variant: "default" };
}
