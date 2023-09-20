import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import SignUp from "./Signup";

export const metadata = {
	title: "Sign Up",
	description: "Create an account to access MEDIMUN's online platform MediBook.",
};

export default async function Page() {
	const session = await getServerSession(authOptions);
	session && redirect("/medibook");

	return (
		<div className="abg-gradient-to-br flex h-screen w-full flex-col justify-center bg-[url(/assets/delegates-indoors.jpg)] from-gray-700 via-gray-900 to-black bg-cover">
			<SignUp />
		</div>
	);
}
