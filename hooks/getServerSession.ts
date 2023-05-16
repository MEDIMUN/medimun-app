import { fetchData } from "next-auth/client/_utils";
import { cookies, headers } from "next/headers";

// next-auth/utils is not listed in export, next will not let you import it
// duplicating
function parseUrl(url: string | undefined) {
	let _url2;

	const defaultUrl = new URL("http://127.0.0.1:3000/api/auth");

	if (url && !url.startsWith("http")) {
		url = `https://${url}`;
		url = url.replace("localhost", "127.0.0.1");
	}

	const _url = new URL((_url2 = url) !== null && _url2 !== void 0 ? _url2 : defaultUrl);

	const path = (_url.pathname === "/" ? defaultUrl.pathname : _url.pathname).replace(/\/$/, "");
	const base = `${_url.origin}${path}`;

	return {
		origin: _url.origin,
		host: _url.host,
		path,
		base,
		toString: () => base,
	};
}

// local variable in `next-auth/react`
const __NEXTAUTH = {
	baseUrl: parseUrl(process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL).origin,
	basePath: parseUrl(process.env.NEXTAUTH_URL).path,
	baseUrlServer: parseUrl(
		process.env.NEXTAUTH_URL_INTERNAL ?? process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL
	).origin,
	basePathServer: parseUrl(process.env.NEXTAUTH_URL_INTERNAL ?? process.env.NEXTAUTH_URL).path,
	_lastSync: 0,
	_session: undefined,
	_getSession: () => {
		// nope
	},
};

const logger = {
	error: console.error,
	warn: console.warn,
	debug: console.log,
};

export const getServerSession = async (authOptions: any) => {
	console.log("upd");
	// code from `next-auth/next` for RSC
	const req: any = {
		headers: Object.fromEntries(headers()),
		cookies: Object.fromEntries(
			cookies()
				.getAll()
				.map((c) => [c.name, c.value])
		),
	};

	// the old `next-auth/react` getSession
	const session = await fetchData("session", __NEXTAUTH, logger, { req });

	return session;
};
