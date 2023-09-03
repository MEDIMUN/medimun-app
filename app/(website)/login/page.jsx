import Login from "./Login";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Image from "next/image";
import DelegateImage from "@/public/placeholders/delegates-2.jpg";

export const metadata = {
	title: "Log In",
	description: "Login to MediBook to access your account.",
};

export default async function Page() {
	const session = await getServerSession(authOptions);
	if (session) redirect("/medibook");

	return (
		<div className="flex h-[100vh] flex-row bg-[#18181B] bg-[url(/assets/delegates-indoors-2.jpg)] bg-cover">
			<div className="flex h-full w-full justify-center bg-white bg-opacity-80 align-middle duration-1000 md:w-[50%] md:bg-opacity-95">
				<Login />
			</div>
		</div>
	);
}
