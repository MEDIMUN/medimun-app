import { HomePage } from "../page";
import AuthRedirect from "@/app/(Website)/components/AuthRedirect";

export default function Page() {
	return (
		<>
			<AuthRedirect unauthenticated="/" />
			<HomePage />;
		</>
	);
}
