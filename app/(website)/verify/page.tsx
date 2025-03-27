import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { Topbar } from "../server-components";
import { VerifyForm } from "./components/form";

export default async function Page(props) {
	const authSession = await auth();
	if (!authSession) notFound();

	return (
		<>
			<Topbar buttonHref={`/`} buttonText={`Home`} title={"Certificate Verification"} />
			<div className="max-w-7xl px-4 mx-auto mb-10">
				<VerifyForm />
			</div>
		</>
	);
}
