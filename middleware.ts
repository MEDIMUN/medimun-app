import { withAuth } from "next-auth/middleware";
import { authorize, s } from "@/lib/authorize";
import { NextResponse } from "next/server";

export default withAuth(
	// `withAuth` augments your `Request` with the user's token.
	function middleware(request) {
		if (request.nextUrl.pathname.startsWith("/medibook/users")) {
			if (!authorize(request.nextauth.token, [s.management])) {
				return NextResponse.error({
					status: 403,
					message: "You are not authorized to access this page",
				});
			}
		}
		if (request.nextUrl.pathname.startsWith("/medibook/schools")) {
			if (!authorize(request.nextauth.token, [s.management])) {
				return NextResponse.error({
					status: 403,
					message: "You are not authorized to access this page",
				});
			}
		}
		if (request.nextUrl.pathname.startsWith("/medibook/locations")) {
			if (!authorize(request.nextauth.token, [s.management])) {
				return NextResponse.error({
					status: 403,
					message: "You are not authorized to access this page",
				});
			}
		}
	}
);

export const config = { matcher: ["/medibook/:path*"] };
