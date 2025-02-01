import { Suspense } from "react";
import InboxesPage from "../inbox-page";

export default function Page(props) {
	return (
		<Suspense fallback={"Loading..."}>
			<InboxesPage {...props} />
		</Suspense>
	);
}
