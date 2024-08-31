import { auth } from "@/auth";
import { authorize, s } from "@/lib/authorize";
import { NextResponse } from "next/server";

export default auth((req) => {
	if (req.nextUrl.pathname.startsWith("/medibook/users")) {
		if (!authorize(req.nextauth.token, [s.management])) {
			return NextResponse.error({
				status: 403,x
				message: "You are not authorized to access this page",
			});
		}
	}
	if (req.nextUrl.pathname.startsWith("/medibook/schools")) {
		if (!authorize(req.nextauth.token, [s.management])) {
			return NextResponse.error({
				status: 403,
				message: "You are not authorized to access this page",
			});
		}
	}
	if (req.nextUrl.pathname.startsWith("/medibook/locations")) {
		if (!authorize(req.nextauth.token, [s.management])) {
			return NextResponse.error({
				status: 403,
				message: "You are not authorized to access this page",
			});
		}
	}
});

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
