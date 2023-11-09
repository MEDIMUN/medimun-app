import { HomePage } from "../page";
import AuthRedirect from "@/components/website/AuthRedirect";

export default function Page() {
	return (
		<>
			<AuthRedirect unauthenticated="/" />
			<HomePage />
		</>
	);
}
