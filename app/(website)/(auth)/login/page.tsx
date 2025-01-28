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

{
	/* <AuthPageWrapper>
			<Suspense fallback={<Icon icon="line-md:loading-loop" width={22} />}>
				<LoginForm allowLogin={process.env.ALLOW_LOGIN} />
			</Suspense>
			<div className="mt-auto flex w-full justify-between rounded-small p-3 bg-content2">
				<p className="text-xs">Don&apos;t have an account?</p>
				<FastLink prefetch={true} href="/signup" className="text-xs text-primary">
					Sign Up
				</FastLink>
			</div>
		</AuthPageWrapper> */
}
