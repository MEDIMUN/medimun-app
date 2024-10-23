import { TopBar } from "@/app/(medibook)/medibook/client-components";
import { Badge } from "@/components/badge";
import { romanize } from "@/lib/romanize";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";

export default async function Page(props) {
	const params = await props.params;
	const selectedDepartment = await prisma.department
		.findFirst({
			where: {
				OR: [{ id: params.departmentId }, { slug: params.departmentId }],
				session: { number: params.sessionNumber },
			},
			include: { session: true },
		})
		.catch(notFound);
	return (
		<>
			<TopBar
				title={`${selectedDepartment.name} Department`}
				buttonHref={`/medibook/medibook/sessionDepartment/sessions/${params.sessionNumber}`}
				buttonText={`Session ${romanize(params.sessionNumber)}`}
				hideSearchBar
			/>
			<Badge className="max-w-max">The department page is coming soon!</Badge>
		</>
	);
}
