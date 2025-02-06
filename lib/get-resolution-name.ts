import { Prisma } from "@prisma/client";

type Resolution = Prisma.ResolutionGetPayload<{
	include: {
		committee: true;
	};
}>;

export function getResolutionName(selectedResolution: Resolution): string | null {
	if (!selectedResolution) return null;
	if (!(selectedResolution satisfies Resolution)) return null;

	const statusToNameMap = {
		DRAFT: "D1",
		SENT_TO_CHAIRS: "D1",
		SENT_TO_APPROVAL_PANEL: "D1",
		ASSIGNED_TO_EDITOR: "D1",
		SENT_BACK_TO_MANAGER: "D2",
		SENT_BACK_TO_COMMITTEE: "D3",
		IN_DEBATE: "D3",
		VOTING: "D3",
		ADOPTED: "A (ADOPTED)",
		FAILED: "R (REJECTED)",
	};

	return `${selectedResolution.committee.shortName?.toUpperCase() ? selectedResolution.committee.shortName?.toUpperCase() : selectedResolution.committee.type === "SECURITYCOUNCIL" ? "SC" : "GA"}/${selectedResolution.timeCreated.getFullYear()}/${selectedResolution.number.toString().padStart(5, "0")}/${statusToNameMap[selectedResolution.status]}`;
}
