import { SignUpForm } from "./client-components";

export default async function Page() {
	return <SignUpForm allowSignUp={process.env.ALLOW_SIGN_UP} />;
}
