import { HomePage } from "../page";
import AuthRedirect from "@/src/app/(Website)/components/AuthRedirect";

export default function Page() {
	return (
		<>
			<AuthRedirect unauthenticated="/" />
			<HomePage />;
		</>
	);
}
