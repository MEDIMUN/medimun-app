import prisma from "@/prisma/client";
import { ApproveApplicationModal, DeleteApplicationModal } from "./modals";

export default async function Default({ searchParams }) {
	let selectedApplication;

	if (searchParams["approve-school-director-application"]) {
		try {
			selectedApplication = await prisma.applicationSchoolDirector.findUnique({
				where: {
					id: searchParams["approve-school-director-application"],
				},
				include: {
					school: true,
					user: {
						include: {
							schoolDirector: {
								include: {
									school: true,
									session: true,
								},
							},
						},
					},
				},
			});
		} catch (error) {
			selectedApplication = null;
		}
	}

	if (searchParams["delete-school-director-application"]) {
		try {
			selectedApplication = await prisma.applicationSchoolDirector.findUnique({
				where: {
					id: searchParams["delete-school-director-application"],
				},
				include: {
					school: true,
					user: {
						include: {
							schoolDirector: {
								include: {
									school: true,
									session: true,
								},
							},
						},
					},
				},
			});
		} catch (error) {
			selectedApplication = null;
		}
		if (selectedApplication?.isApproved) selectedApplication = null;
	}

	if (searchParams["delete-school-director-application"] && searchParams["approve-school-director-application"]) selectedApplication = null;

	return (
		<>
			<ApproveApplicationModal selectedApplication={selectedApplication} />
			<DeleteApplicationModal selectedApplication={selectedApplication} />
		</>
	);
}
