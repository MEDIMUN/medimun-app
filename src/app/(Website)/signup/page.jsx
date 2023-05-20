import style from "./page.module.css";
import SignUp from "./SignUp";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const metadata = {
	title: "Create An Account - MEDIMUN",
	description: "Create an account to access MEDIMUN's online platform MediBook.",
};

export default async function Page() {
	const session = await getServerSession(authOptions);
	session && redirect("/medibook");

	return (
		<div className={style.page}>
			<div className={style.sidebarOverlay}>
				<SignUp />
			</div>
			<div aria-hidden className={style.sidebar}>
				{/* 				<h1 className={style.title}>Login</h1>
				 */}
			</div>
		</div>
	);
}

const getSession = async () => {};
