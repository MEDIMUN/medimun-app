"use server";

import "server-only";

import prisma from "@/prisma/client";
import sendVerificationEmail from "@/email/templates/email-verification";
import { hashPassword } from "@/lib/auth";


function titleCase ( str, separator ) {
	let splitStr = str.split( separator );
	for ( var i = 0; i < splitStr.length; i++ ) {
		splitStr[ i ] = splitStr[ i ].charAt( 0 ).toUpperCase() + splitStr[ i ].substring( 1 );
	}
	return splitStr.join( separator );
}

function generateRandom12DigitNumber () {
	let number = Math.floor( Math.random() * 9 ) + 1;
	for ( let i = 1; i < 12; i++ ) {
		number = number * 10 + Math.floor( Math.random() * 10 );
	}
	return number;
}

export async function checkEmail ( email ) {
	let user, pendingUser;
	try {
		[ user, pendingUser ] = await Promise.all( [ user, pendingUser ] );
		user = prisma.user.findUnique( {
			where: {
				email: email,
			},
		} );
		pendingUser = prisma.pendingUser.findUnique( {
			where: {
				email: email,
			},
		} );
	} catch ( e ) {
		return {
			ok: false,
			error: "Could not check if email exists",
		};
	}
	if ( await user ) {
		return {
			ok: true,
			exists: true,
		};
	}
	if ( await pendingUser ) {
		try {
			await prisma.pendingUser.deleteMany( {
				where: {
					email: email,
				},
			} );
		} catch ( e ) {
			return {
				ok: false,
				error: "Could not check if email exists",
			};
		}
	}

	return {
		ok: true,
		exists: false,
	};
}

async function checkEmailWithPending ( email ) {
	let user, pendingUser;
	try {
		user = await prisma.user.findUnique( {
			where: {
				email: email,
			},
		} );
	} catch ( e ) {
		return {
			ok: false,
			error: "Could not check if email exists",
		};
	}
	try {
		pendingUser = await prisma.pendingUser.findUnique( {
			where: {
				email: email,
			},
		} );
	} catch ( e ) {
		return {
			ok: false,
			error: "Could not check if email exists",
		};
	}
	if ( user || pendingUser ) {
		return {
			ok: true,
			exists: true,
		};
	}
	return {
		ok: true,
		exists: false,
	};
}

export async function signUp ( user ) {
	const emailVerificationCode = Math.floor( Math.random() * 1000000 );
	const officialName = titleCase( titleCase( titleCase( user.officialName.replace( "  ", "" ).toLowerCase(), " " ), "-" ), "'" ).trim();
	const officialSurname = titleCase( titleCase( titleCase( user.officialSurname.replace( "  ", "" ).toLowerCase(), " " ), "-" ), "'" ).trim();
	const email = user.email.toLowerCase().trim();
	const password = user.password;
	const dateOfBirth = user.dateOfBirth;

	if ( !email || !officialName || !officialSurname || !dateOfBirth || !password ) {
		return {
			ok: false,
			error: "Missing Data",
		};
	}

	if ( email == "" || !/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/.test( email ) || ( await checkEmailWithPending( email ) ).exists ) {
		return {
			ok: false,
			error: "Invalid email",
		};
	}
	if ( !officialName || officialName.length < 2 || officialName.length > 50 ) {
		return {
			ok: false,
			error: "Invalid name",
		};
	}
	if ( !officialSurname || officialSurname.length < 2 || officialSurname.length > 50 ) {
		return {
			ok: false,
			error: "Invalid surname",
		};
	}
	if ( !dateOfBirth || typeof dateOfBirth != "object" ) {
		return {
			ok: false,
			error: "Invalid date of birth",
		};
	}
	if (
		!(
			/[A-Z]/.test( password ) &&
			/[a-z]/.test( password ) &&
			/[0-9]/.test( password ) &&
			/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test( password ) &&
			password.length > 7 &&
			password !== ""
		)
	) {
		return {
			ok: false,
			error: "Invalid password",
		};
	}
	console.log( officialName, officialSurname, email, emailVerificationCode.toString() );
	try {
		await sendVerificationEmail( officialName, email, emailVerificationCode.toString() );
	} catch ( e ) {
		return {
			ok: false,
			error: "Could not sign you up, please try again later.",
		};
	}

	try {
		await prisma.pendingUser.create( {
			data: {
				officialName,
				officialSurname,
				email,
				password,
				dateOfBirth,
				emailVerificationCode: emailVerificationCode.toString(),
			},
		} );
	} catch ( error ) {
		return {
			ok: false,
			error: "Could not sign you up, please try again later.",
		};
	}
	return {
		ok: true,
		message: "Signed Up, please verify email to actvate",
	};
}

export async function createUser ( email, code ) {
	let user;
	try {
		user = await prisma.pendingUser.findFirst( {
			where: {
				emailVerificationCode: code,
			},
			select: {
				email: true,
				officialName: true,
				officialSurname: true,
				nationality: true,
				dateOfBirth: true,
				password: true,
			},
		} );
	} catch ( e ) {
		return {
			ok: false,
			error: "Error creating user",
		};
	}
	if ( !user ) {
		return {
			ok: false,
			error: "Invalid code",
		};
	}
	try {
		await prisma.pendingUser.deleteMany( {
			where: {
				emailVerificationCode: code,
			},
		} );
	} catch ( e ) {
		return {
			ok: false,
			error: "Error creating user",
		};
	}
	try {
		await prisma.user.create( {
			data: {
				email: user.email,
				officialName: user.officialName,
				officialSurname: user.officialSurname,
				nationality: user.nationality,
				dateOfBirth: user.dateOfBirth,
				id: generateRandom12DigitNumber().toString(),
				account: {
					create: {
						password: await hashPassword( user.password ),
					},
				},
			},
		} );
	} catch ( e ) {
		return {
			ok: false,
			error: "Error creating user",
		};
	}

	return {
		ok: true,
		message: "User created successfully",
	};
}
