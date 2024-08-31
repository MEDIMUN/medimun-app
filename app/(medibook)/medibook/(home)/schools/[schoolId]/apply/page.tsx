import { auth } from "@/auth";

export default async function Page({ params, searchParams }) {
	const authSession = await auth();
	return <div>{JSON.stringify(authSession, null, 2)}</div>;
}
