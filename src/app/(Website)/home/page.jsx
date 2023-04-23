import { HomePage } from "../page";
import AuthRedirect from "../AuthRedirect";

export default function Page() {
	return (
		<>
			<AuthRedirect unauthenticated="/" />
			<HomePage />;
		</>
	);
}
