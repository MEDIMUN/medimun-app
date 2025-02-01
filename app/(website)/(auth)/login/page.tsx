import type { Metadata } from "next";
import { LoginForm } from "@/app/(website)/(auth)/login/_components/login-form";

export const experimental_ppr = true;

export const metadata: Metadata = {
	title: "Log In",
	description: "Login to MediBook to access your account.",
	keywords: "MUNCOMMAND, MEDIBOOK, medibook, login, medimun, mediterranean, model, united, nations, MUN",
	openGraph: {
		title: "Log In - MediBook",
		description: "Login to MediBook to access your account.",
		images: [{ url: "/placeholders/delegates-2.jpg" }],
	},
};

export default function Page() {
	return <LoginForm />;
}
