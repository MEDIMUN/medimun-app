import style from "./page.module.css";
import Login from "./Login";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const metadata = {
	title: "Log in to MediBook - MEDIMUN",
	description: "Login to MediBook to access your account.",
};

export default async function Page() {
	const session = await getServerSession(authOptions);
	console.log(session);

	if (session) {
		return redirect("/medibook");
	}

	return (
		<div className={style.page}>
			<div className={style.sidebarOverlay}>
				<Login />
			</div>
			<div aria-hidden className={style.sidebar}>
				{/* 				<h1 className={style.title}>Login</h1>
				 */}
			</div>
		</div>
	);
}

const getSession = async () => {};
