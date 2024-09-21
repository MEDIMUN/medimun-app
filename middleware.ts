import NextAuth from "next-auth";
import { NextResponse, NextRequest } from "next/server";
import { authorize, s } from "./lib/authorize";

const { auth } = NextAuth({
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/login",
	},
	callbacks: {
		authorized({ auth }) {
			const isAuthenticated = !!auth?.user;
			return isAuthenticated;
		},
		async jwt({ token, user, trigger }) {
			if (user) token.user = user;
			return token;
		},
		async session({ session, token }) {
			session.user = token.user;
			return session;
		},
	},
	providers: [],
	secret: process.env.AUTH_SECRET,
	logger: {
		error: () => {},
		warn: () => {},
		debug: () => {},
	},
});

const managementDirectPaths = ["/medibook/schools", "/medibook/users", "/medibook/locations"];
const logggedInNotAllowedPaths = ["/login", "/signup", "/"];

export default auth((req) => {
	const { nextUrl } = req;
	const { pathname } = nextUrl;
	const authSession = req.auth;
	const isDisabled = authSession?.user?.isDisabled;
	const isAuthenticated = !!req.auth;

	if (pathname.includes("/medibook") && isDisabled) return NextResponse.redirect(new URL(`/`, nextUrl.origin));

	const isManagement = authorize(authSession, [s.management]);

	if (authSession?.user?.isDisabled && pathname == "/login") return NextResponse.redirect(new URL("/", nextUrl.origin));

	if (pathname.includes("/medibook") && !isAuthenticated) return NextResponse.redirect(new URL(`/login?after-login=${pathname}`, nextUrl.origin));

	if (managementDirectPaths.includes(pathname) && isAuthenticated && !isManagement)
		return NextResponse.rewrite(new URL("/medibook/not-found", nextUrl.origin));

	if (logggedInNotAllowedPaths.includes(pathname) && isAuthenticated) return NextResponse.redirect(new URL("/medibook", nextUrl.origin));

	//if path matches /medibook/session/<anyNumber>/applications/* check with regex
	if (pathname.includes("/medibook/session") && pathname.includes("/applications") && !isManagement)
		return NextResponse.redirect(new URL(`/medibook/not-found`, nextUrl.origin));

	/* 	if (!pathname.includes("/medibook") && !pathname.includes("/home") && isAuthenticated) {
		return NextResponse.redirect(new URL("/medibook", nextUrl.origin));
	}

	if ((pathname.includes("/medibook") || pathname.includes("/home")) && !isAuthenticated) {
		return NextResponse.redirect(new URL(`/login?after-login=${pathname}`, nextUrl.origin));
	} */

	/* 	if (nextUrl.pathname.includes("/dashboard") && !isAuthenticated) {
		return NextResponse.redirect(new URL(`/login?return=${nextUrl.pathname}`, nextUrl.origin));
	}

	if (nextUrl.pathname.includes("/dashboard") && isAuthenticated && !req.auth.user.admin) {
		return NextResponse.redirect(new URL("/", nextUrl.origin));
	}

	if (nextUrl.pathname.includes("/vote") && !isAuthenticated) {
		return NextResponse.redirect(new URL(`/login?return=${nextUrl.pathname}`, nextUrl.origin));
	}

	if (nextUrl.pathname.includes("/vote") && isAuthenticated && !req.auth.user.student) {
		return NextResponse.redirect(new URL("/", nextUrl.origin));
	}

	if (nextUrl.pathname.includes("/profile") && !isAuthenticated) {
		return NextResponse.redirect(new URL(`/login?return=${nextUrl.pathname}`, nextUrl.origin));
	}

	if (nextUrl.pathname.includes("/profile") && isAuthenticated && !req.auth.user.candidate) {
		return NextResponse.redirect(new URL("/", nextUrl.origin));
	} */
});

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets|api|placeholders).*)"],
};
