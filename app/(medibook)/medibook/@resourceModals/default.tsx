import prisma from "@/prisma/client";
import { ModalUploadResource } from "./modalCreateResource";
import { ModalEditResource } from "./modalEditResource";
import { Resource, ResourcePrivacyTypes } from "@prisma/client";
import { auth } from "@/auth";
import { authorize, authorizeChairCommittee, authorizeManagerDepartment, s } from "@/lib/authorize";
import { ModalDeleteResource } from "./modalDeleteResource";

export const greaterScopeList = [
	{ value: "WEBSITE", text: "Global Resource" },
	{ value: "MEDIBOOK", text: "MediBook Only Resource" },
	{ value: "SESSIONPROSPECTUS", text: "Session Prospectus" },
	{ value: "SESSIONWEBSITE", text: "Global Session Resource" },
	{ value: "SESSIONSCOPED", text: "Customized Scoped Session Rsource" },
	{ value: "COMMITTEEWEBSITE", text: "Global Committee Resource" },
	{ value: "COMMITTEESCOPED", text: "Customized Scope Committee Resource" },
	{ value: "DEPARTMENTWEBSITE", text: "Global Department Resource" },
	{ value: "DEPARTMENTSCOPED", text: "Customized Scope Department Resource" },
	{ value: "SYSTEM", text: "System Resource" },
	{ value: "PERSONAL", text: "Personal" },
];

export const innerScopeList = {
	SESSIONPROSPECTUS: [{ value: "SESSIONPROSPECTUS", text: "Prospectus", disabled: true }],
	WEBSITE: [
		{ value: "WEBSITE", text: "Website", description: "", disabled: true },
		{ value: "CHAIR", text: "Chair", description: "", disabled: true },
		{ value: "MANAGER", text: "Manager", description: "", disabled: true },
		{ value: "DELEGATE", text: "Delegate", description: "", disabled: true },
		{ value: "MEMBER", text: "Member", description: "", disabled: true },
		{ value: "SECRETARIAT", text: "Secretariat", description: "", disabled: true },
		{ value: "SCHOOLDIRECTORS", text: "Directors", description: "", disabled: true },
		{ value: "DIRECTORS", text: "Directors", description: "", disabled: true },
		{ value: "SENIORDIRECTORS", text: "Senior Directors", description: "", disabled: true },
	],
	MEDIBOOK: [
		{ value: "CHAIR", text: "Chair", description: "", disabled: false },
		{ value: "MANAGER", text: "Manager", description: "", disabled: false },
		{ value: "DELEGATE", text: "Delegate", description: "", disabled: false },
		{ value: "MEMBER", text: "Member", description: "", disabled: false },
		{ value: "SECRETARIAT", text: "Secretariat", description: "", disabled: false },
		{ value: "SCHOOLDIRECTORS", text: "School Directors", description: "", disabled: false },
		{ value: "DIRECTORS", text: "Directors", description: "", disabled: false },
		{ value: "SENIORDIRECTORS", text: "Senior Directors", description: "", disabled: false },
	],
	SESSIONWEBSITE: [
		{ value: "SESSIONWEBSITE", text: "Website", description: "Session Section", disabled: true },
		{ value: "SESSIONCHAIR", text: "Chairs", description: "in Session", disabled: true },
		{ value: "SESSIONMANAGER", text: "Managers", description: "in Session", disabled: true },
		{ value: "SESSIONDELEGATE", text: "Delegates", description: "in Session", disabled: true },
		{ value: "SESSIONMEMBER", text: "Members", description: "in Session", disabled: true },
		{ value: "SESSIONSECRETARIAT", text: "Secretariat Members", description: "in Session", disabled: true },
		{ value: "SESSIONSCHOOLDIRECTORS", text: "School Directors", description: "in Session", disabled: true },
		{ value: "SESSIONDIRECTORS", text: "Directors", description: "", disabled: true },
		{ value: "SESSIONSENIORDIRECTORS", text: "Senior Directors", description: "", disabled: true },
	],
	SESSIONSCOPED: [
		{ value: "SESSIONCHAIR", text: "Chairs", description: "in Session", disabled: false },
		{ value: "SESSIONMANAGER", text: "Managers", description: "in Session", disabled: false },
		{ value: "SESSIONDELEGATE", text: "Delegates", description: "in Session", disabled: false },
		{ value: "SESSIONMEMBER", text: "Members", description: "in Session", disabled: false },
		{ value: "SESSIONSECRETARIAT", text: "Secretariat Members", description: "in Session", disabled: false },
		{ value: "SESSIONSCHOOLDIRECTORS", text: "School Directors", description: "in Session", disabled: false },
		{ value: "SESSIONDIRECTORS", text: "Directors", description: "", disabled: false },
		{ value: "SESSIONSENIORDIRECTORS", text: "Senior Directors", description: "", disabled: false },
	],
	COMMITTEEWEBSITE: [
		{ value: "COMMITTEEWEBSITE", text: "Website", description: "Committee Section of Session", disabled: true },
		{ value: "COMMITTEECHAIR", text: "Chair", description: "of Committee", disabled: true },
		{ value: "COMMITTEEMANAGER", text: "Manager", description: "in Session with Access to Committee", disabled: true },
		{ value: "COMMITTEEDELEGATE", text: "Delegate", description: "in Committee", disabled: true },
		{ value: "COMMITTEEMEMBER", text: "Member", description: "in Session with Access to Committee", disabled: true },
		{ value: "COMMITTEESECRETARIAT", text: "Secretariat", description: "of Session of Committee", disabled: true },
		{ value: "COMMITTEEDIRECTORS", text: "Directors", description: "viewing Committee", disabled: true },
		{ value: "COMMITTEESENIORDIRECTORS", text: "Senior Directors", description: "viewing Committee", disabled: true },
	],
	COMMITTEESCOPED: [
		{ value: "COMMITTEECHAIR", text: "Chair", description: "of Committee", disabled: false },
		{ value: "COMMITTEEMANAGER", text: "Manager", description: "in Session with Access to Committee", disabled: false },
		{ value: "COMMITTEEDELEGATE", text: "Delegate", description: "in Committee", disabled: false },
		{ value: "COMMITTEEMEMBER", text: "Member", description: "in Session with Access to Committee", disabled: false },
		{ value: "COMMITTEESECRETARIAT", text: "Secretariat", description: "viewing Committee", disabled: false },
		{ value: "COMMITTEEDIRECTORS", text: "Directors", description: "viewing Committee", disabled: false },
		{ value: "COMMITTEESENIORDIRECTORS", text: "Senior Directors", description: "viewing Committee", disabled: false },
	],
	DEPARTMENTWEBSITE: [
		{ value: "DEPARTMENTWEBSITE", text: "Website", description: "Department Section of Session", disabled: true },
		{ value: "DEPARTMENTMANAGER", text: "Manager", description: "of Department", disabled: true },
		{ value: "DEPARTMENTMEMBER", text: "Member", description: "of Department", disabled: true },
		{ value: "DEPARTMENTSECRETARIAT", text: "Secretariat", description: "viewing Department", disabled: true },
		{ value: "DEPARTMENTDIRECTORS", text: "Directors", description: "viewing Department", disabled: true },
	],
	DEPARTMENTSCOPED: [
		{ value: "DEPARTMENTMANAGER", text: "Manager", description: "of Department", disabled: false },
		{ value: "DEPARTMENTMEMBER", text: "Member", description: "of Department", disabled: false },
		{ value: "DEPARTMENTSECRETARIAT", text: "Secretariat", description: "viewing Department", disabled: false },
		{ value: "DEPARTMENTDIRECTORS", text: "Directors", description: "viewing Department", disabled: false },
		{ value: "DEPARTMENTSENIORDIRECTORS", text: "Senior Directors", description: "viewing Department", disabled: false },
	],
	SYSTEM: [{ value: "SYSTEM", text: "System", description: "", disabled: true }],
	PERSONAL: [{ value: "PERSONAL", text: "Personal", description: "", disabled: true }],
};

export const searchParamsGreaterScopeMap = {
	uploadsessionprospectus: ["SESSIONPROSPECTUS"],
	uploadglobalresource: ["WEBSITE", "MEDIBOOK"],
	uploadsessionresource: ["SESSIONWEBSITE", "SESSIONSCOPED"],
	uploadcommitteeresource: ["COMMITTEEWEBSITE", "COMMITTEESCOPED"],
	uploaddepartmentresource: ["DEPARTMENTWEBSITE", "DEPARTMENTSCOPED"],
	uploadresource: ["PERSONAL"],
	uploadsystemresource: ["SYSTEM"],
};

export const useableSearchParams = [
	"uploadsessionresource",
	"uploadcommitteeresource",
	"uploaddepartmentresource",
	"uploadglobalresource",
	"uploadresource",
	"uploadsystemresource",
	"uploadsessionprospectus",
];

export function authorizedToEditResource(authSession, editResourceData) {
	const isManagement = authorize(authSession, [s.management]);
	const scopeAuthorizationBooleanMap = {
		SESSIONPROSPECTUS: isManagement,
		WEBSITE: isManagement,
		CHAIR: isManagement,
		MANAGER: isManagement,
		DELEGATE: isManagement,
		MEMBER: isManagement,
		SECRETARIAT: isManagement,
		SCHOOLDIRECTORS: isManagement,
		DIRECTORS: isManagement,
		SENIORDIRECTORS: isManagement,
		SESSIONWEBSITE: isManagement,
		SESSIONCHAIR: isManagement,
		SESSIONMANAGER: isManagement,
		SESSIONDELEGATE: isManagement,
		SESSIONMEMBER: isManagement,
		SESSIONSECRETARIAT: isManagement,
		SESSIONSCHOOLDIRECTORS: isManagement,
		SESSIONDIRECTORS: isManagement,
		SESSIONSENIORDIRECTORS: isManagement,
		COMMITTEEWEBSITE:
			isManagement || authorizeChairCommittee([...authSession.user.currentRoles, ...authSession.user.pastRoles], editResourceData.committeeId),
		COMMITTEECHAIR:
			isManagement || authorizeChairCommittee([...authSession.user.currentRoles, ...authSession.user.pastRoles], editResourceData.committeeId),
		COMMITTEEMANAGER:
			isManagement || authorizeChairCommittee([...authSession.user.currentRoles, ...authSession.user.pastRoles], editResourceData.committeeId),
		COMMITTEEDELEGATE:
			isManagement || authorizeChairCommittee([...authSession.user.currentRoles, ...authSession.user.pastRoles], editResourceData.committeeId),
		COMMITTEEMEMBER:
			isManagement || authorizeChairCommittee([...authSession.user.currentRoles, ...authSession.user.pastRoles], editResourceData.committeeId),
		COMMITTEESECRETARIAT:
			isManagement || authorizeChairCommittee([...authSession.user.currentRoles, ...authSession.user.pastRoles], editResourceData.committeeId),
		COMMITTEEDIRECTORS:
			isManagement || authorizeChairCommittee([...authSession.user.currentRoles, ...authSession.user.pastRoles], editResourceData.committeeId),
		COMMITTEESENIORDIRECTORS:
			isManagement || authorizeChairCommittee([...authSession.user.currentRoles, ...authSession.user.pastRoles], editResourceData.committeeId),
		DEPARTMENTWEBSITE:
			isManagement || authorizeManagerDepartment([...authSession.user.currentRoles, ...authSession.user.pastRoles], editResourceData.departmentId),
		DEPARTMENTMANAGER:
			isManagement || authorizeManagerDepartment([...authSession.user.currentRoles, ...authSession.user.pastRoles], editResourceData.departmentId),
		DEPARTMENTMEMBER:
			isManagement || authorizeManagerDepartment([...authSession.user.currentRoles, ...authSession.user.pastRoles], editResourceData.departmentId),
		DEPARTMENTSECRETARIAT:
			isManagement || authorizeManagerDepartment([...authSession.user.currentRoles, ...authSession.user.pastRoles], editResourceData.departmentId),
		DEPARTMENTDIRECTORS:
			isManagement || authorizeManagerDepartment([...authSession.user.currentRoles, ...authSession.user.pastRoles], editResourceData.departmentId),
		DEPARTMENTSENIORDIRECTORS:
			isManagement || authorizeManagerDepartment([...authSession.user.currentRoles, ...authSession.user.pastRoles], editResourceData.departmentId),
		SYSTEM: authorize(authSession, [s.admins]),
		PERSONAL: authSession?.user.id === editResourceData?.userId,
	};

	if (!editResourceData?.scope) return false;

	const filteredScopeAuthorizationBooleanMapArray = editResourceData?.scope?.map((scope) => {
		return scopeAuthorizationBooleanMap[scope];
	});

	if (!filteredScopeAuthorizationBooleanMapArray.includes(true)) {
		return false;
	}

	return true;
}

export default async function Modals(props) {
    const searchParams = await props.searchParams;
    const authSession = await auth();
    let editResourceData: Resource | null = null;
    let deleteResourceData: Resource | null = null;

    if (searchParams["edit-resource"]) {
		editResourceData = await prisma.resource.findFirst({
			where: { id: searchParams["edit-resource"] },
			include: { session: true, committee: { include: { session: true } }, department: { include: { session: true } } },
		});

		if (!authorizedToEditResource(authSession, editResourceData)) {
			editResourceData = null;
		}
	}

    if (searchParams["delete-resource"]) {
		deleteResourceData = await prisma.resource.findFirst({
			where: { id: searchParams["delete-resource"] },
			include: { session: true, committee: { include: { session: true } }, department: { include: { session: true } } },
		});

		if (!authorizedToEditResource(authSession, deleteResourceData)) {
			deleteResourceData = null;
		}
	}

    return (
		<>
			<ModalDeleteResource selectedResource={deleteResourceData} />
			<ModalEditResource selectedResource={editResourceData} />
			<ModalUploadResource />
		</>
	);
}
