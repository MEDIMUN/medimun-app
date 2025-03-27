import prisma from "@/prisma/client";
import { ApproveApplicationModal, ApproveSchoolDelegateAssignmentProposalModal, DeleteApplicationModal } from "./modals";

export default async function Default(props) {
	const searchParams = await props.searchParams;
	const { sessionNumber } = await props.params;
	let selectedApplication, selectedAssignmentProposal, selectedUsers;

	if (searchParams["approve-school-director-application"]) {
		try {
			selectedApplication = await prisma.applicationSchoolDirector.findUnique({
				where: { id: searchParams["approve-school-director-application"] },
				include: { school: true, user: { include: { schoolDirector: { include: { school: true, session: true } } } } },
			});
		} catch (error) {
			selectedApplication = null;
		}
	}

	if (searchParams["delete-school-director-application"]) {
		try {
			selectedApplication = await prisma.applicationSchoolDirector.findUnique({
				where: { id: searchParams["delete-school-director-application"] },
				include: { school: true, user: { include: { schoolDirector: { include: { school: true, session: true } } } } },
			});
		} catch (error) {
			selectedApplication = null;
		}
		if (selectedApplication?.isApproved) selectedApplication = null;
	}

	if (searchParams["approve-school-delegate-assignment-proposal"]) {
		try {
			selectedAssignmentProposal = await prisma.schoolDelegationProposal.findUnique({
				where: { id: searchParams["approve-school-delegate-assignment-proposal"], session: { number: sessionNumber } },
				include: { session: true, school: { include: { director: { where: { session: { number: sessionNumber } }, include: { user: true } } } } },
			});

			const originalAssignment = selectedAssignmentProposal.assignment ? JSON.parse(selectedAssignmentProposal.assignment) : [];
			const modifiedAssignment = selectedAssignmentProposal.changes ? JSON.parse(selectedAssignmentProposal.changes) : [];

			const allUserIds = originalAssignment
				.concat(modifiedAssignment)
				.map((a) => a.studentId)
				.filter((x) => x);
			selectedUsers = await prisma.user.findMany({
				where: { id: { in: allUserIds } },
				omit: { signature: true },
			});
			selectedAssignmentProposal.assignment = originalAssignment;
			selectedAssignmentProposal.changes = modifiedAssignment;
		} catch (error) {
			selectedAssignmentProposal = null;
			selectedUsers = null;
		}
	}

	if (searchParams["delete-school-director-application"] && searchParams["approve-school-director-application"]) selectedApplication = null;

	return (
		<>
			{selectedApplication && <ApproveApplicationModal selectedApplication={selectedApplication} />}
			{selectedApplication && <DeleteApplicationModal selectedApplication={selectedApplication} />}
			{selectedAssignmentProposal && <ApproveSchoolDelegateAssignmentProposalModal selectedUsers={selectedUsers} selectedAssignmentProposal={selectedAssignmentProposal} />}
		</>
	);
}
