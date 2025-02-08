import { Prisma } from "@prisma/client";
import { authorize, authorizeChairCommittee, authorizeDelegateCommittee, s } from "./authorize";
import { Session } from "next-auth";

type resolutionType = Prisma.ResolutionGetPayload<{
	include: {
		CoSubmitters: {
			include: {
				delegate: {
					include: {
						user: true;
					};
				};
			};
		};
		editor: {
			include: {
				user: true;
			};
		};
		mainSubmitter: {
			include: {
				user: true;
			};
		};
		committee: true;
	};
}>;

export function canEditResolution(authSession: Session, resolution: resolutionType): "EDIT" | "VIEW" | "NOT_FOUND" {
	const isMember = authorize(authSession, [s.member]);
	const isManager = authorize(authSession, [s.manager]);
	const isChair = authorize(authSession, [s.chair]);
	const isDelegate = authorize(authSession, [s.delegate]);
	const isManagement = authorize(authSession, [s.management]);

	if (["ADOPTED", "FAILED"].includes(resolution?.status)) return "VIEW";

	const allowedMemberDepartmentTypes = ["APPROVAL"];
	const isMemberOfAp: boolean =
		isMember && authSession?.user?.currentRoles.filter((role) => role.roleIdentifier == "member").filter((role) => role?.departmentTypes?.some((type) => allowedMemberDepartmentTypes?.includes(type))).length > 0;

	const isManagerOfAp: boolean =
		isManager && authSession?.user?.currentRoles.filter((role) => role?.roleIdentifier == "manager").filter((role) => role?.departmentTypes?.some((type) => allowedMemberDepartmentTypes?.includes(type))).length > 0;

	const isEditorOfResolution = resolution?.editor?.userId == authSession?.user?.id;

	const isChairOfCommittee = authorizeChairCommittee([...(authSession?.user?.pastRoles || []), ...(authSession?.user?.currentRoles || [])], resolution?.committeeId);

	const isDelegateOfCommittee = authorizeDelegateCommittee([...(authSession?.user?.pastRoles || []), ...(authSession?.user?.currentRoles || [])], resolution?.committeeId);

	const isSubmitterOfResolution = resolution?.mainSubmitter?.userId == authSession?.user?.id;
	const isCoSubmitterOfResolution = resolution?.CoSubmitters?.some((coSubmitter) => coSubmitter.delegate.userId == authSession?.user?.id);

	if (["DRAFT"].includes(resolution?.status)) {
		if (isChairOfCommittee || isManagement || isSubmitterOfResolution || isCoSubmitterOfResolution) return "EDIT";
		return "NOT_FOUND";
	}

	if (["SENT_TO_CHAIRS"].includes(resolution?.status)) {
		if (isChairOfCommittee || isManagement) {
			return "EDIT";
		} else if (isSubmitterOfResolution || isCoSubmitterOfResolution) {
			return "VIEW";
		}
	}

	if (["SENT_TO_APPROVAL_PANEL"].includes(resolution?.status)) {
		if (isManagerOfAp || isManagement) return "EDIT";
		if (isMemberOfAp) return "VIEW";
		if (isSubmitterOfResolution || isCoSubmitterOfResolution) return "VIEW";
		if (isChairOfCommittee) return "VIEW";
		return "NOT_FOUND";
	}

	if (["ASSIGNED_TO_EDITOR"].includes(resolution?.status)) {
		if (isManagerOfAp || isManagement || (isEditorOfResolution && isMemberOfAp)) return "EDIT";
		if (isSubmitterOfResolution || isCoSubmitterOfResolution) return "VIEW";
		if (isChairOfCommittee) return "VIEW";
	}

	if (["VOTING", "IN_DEBATE"].includes(resolution?.status)) {
		if (isChairOfCommittee || isManagement) {
			return "EDIT";
		} else if (isDelegateOfCommittee) {
			return "VIEW";
		}
	}

	if (["SENT_BACK_TO_MANAGER"].includes(resolution?.status)) {
		if (isManagement || isManagerOfAp) {
			return "EDIT";
		} else if (isEditorOfResolution) {
			return "VIEW";
		} else if (isMemberOfAp) {
			return "VIEW";
		} else if (isChairOfCommittee) {
			return "VIEW";
		} else if (isSubmitterOfResolution || isCoSubmitterOfResolution) {
			return "VIEW";
		}
	}

	if (["SENT_BACK_TO_COMMITTEE", "VOTING", "IN_DEBATE"].includes(resolution?.status)) {
		if (isChairOfCommittee || isManagement) {
			return "EDIT";
		}
		if (isDelegateOfCommittee) {
			return "VIEW";
		}
	}

	return "NOT_FOUND";
}
