import { TopBar } from "@/app/(medibook)/medibook/client-components";
import { romanize } from "@/lib/romanize";
import prisma from "@/prisma/client";

export default async function Page({ params }) {
	const selectedSession = await prisma.session.findFirst({
		where: { number: params.sessionNumber },
	});

	return (
		<>
			<TopBar
				buttonText={`Session ${romanize(selectedSession.numberInteger)}`}
				buttonHref={`/medibook/sessions/${selectedSession.number}`}
				hideSearchBar
				title="Delegation Declarations"
			/>
		</>
	);
}
