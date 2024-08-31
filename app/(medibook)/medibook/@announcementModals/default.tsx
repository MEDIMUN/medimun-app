import prisma from "@/prisma/client";
import { ModalEditAnnouncement } from "./parallelEditAnnouncement";
import { Resource } from "@prisma/client";
import { auth } from "@/auth";
import { authorize, authorizeChairCommittee, authorizeManagerDepartment, s } from "@/lib/authorize";
import { ModalDeleteResource } from "./modalDeleteResource";
import { Link } from "@/components/link";

export function authorizedToEditAnnouncement(authSession, committeeId, departmentId) {
	const isManagement = authorize(authSession, [s.management]);
	const scopeAuthorizationBooleanMap = {
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
		COMMITTEEWEBSITE: isManagement || authorizeChairCommittee([...authSession?.currentRoles], committeeId),
		COMMITTEECHAIR: isManagement || authorizeChairCommittee([...authSession?.currentRoles], committeeId),
		COMMITTEEMANAGER: isManagement || authorizeChairCommittee([...authSession?.currentRoles], committeeId),
		COMMITTEEDELEGATE: isManagement || authorizeChairCommittee([...authSession?.currentRoles], committeeId),
		COMMITTEEMEMBER: isManagement || authorizeChairCommittee([...authSession?.currentRoles], committeeId),
		COMMITTEESECRETARIAT: isManagement || authorizeChairCommittee([...authSession?.currentRoles], committeeId),
		COMMITTEESCHOOLDIRECTORS: isManagement || authorizeChairCommittee([...authSession?.currentRoles], committeeId),
		COMMITTEEDIRECTORS: isManagement || authorizeChairCommittee([...authSession?.currentRoles], committeeId),
		COMMITTEESENIORDIRECTORS: isManagement || authorizeChairCommittee([...authSession?.currentRoles], committeeId),
		DEPARTMENTWEBSITE: isManagement || authorizeManagerDepartment([...authSession?.currentRoles], departmentId),
		DEPARTMENTMANAGER: isManagement || authorizeManagerDepartment([...authSession?.currentRoles], departmentId),
		DEPARTMENTMEMBER: isManagement || authorizeManagerDepartment([...authSession?.currentRoles], departmentId),
		DEPARTMENTSECRETARIAT: isManagement || authorizeManagerDepartment([...authSession?.currentRoles], departmentId),
		DEPARTMENTDIRECTORS: isManagement || authorizeManagerDepartment([...authSession?.currentRoles], departmentId),
		DEPARTMENTSENIORDIRECTORS: isManagement || authorizeManagerDepartment([...authSession?.currentRoles], departmentId),
	};
	return scopeAuthorizationBooleanMap;
}

export const typeGreaterScopeMapList = {
	globalAnnouncement: [
		{ value: "WEBSITE", text: "Website Announcement" },
		{ value: "MEDIBOOK", text: "MediBook Announcement" },
	],
	sessionAnnouncement: [
		{ value: "SESSIONWEBSITE", text: "Session Website Announcement" },
		{ value: "SESSIONSCOPED", text: "Session MediBook Announcement" },
	],
	committeeAnnouncement: [
		{ value: "COMMITTEEWEBSITE", text: "Committee Website Announcement" },
		{ value: "COMMITTEESCOPED", text: "Committee MediBook Announcement" },
	],
	departmentAnnouncement: [
		{ value: "DEPARTMENTWEBSITE", text: "Department Website Announcement" },
		{ value: "DEPARTMENTSCOPED", text: "Department MediBook Announcement" },
	],
};

export const announcementWebsitecomponents = {
	h1: (props) => <h1 className="mb-4 mt-8 text-4xl font-bold">{props.children}</h1>,
	h2: (props) => <h2 className="mb-4 mt-6 text-3xl font-bold">{props.children}</h2>,
	h3: (props) => <h3 className="mb-4 mt-6 text-2xl font-bold">{props.children}</h3>,
	h4: (props) => <h4 className="mb-4 mt-6 text-xl font-bold">{props.children}</h4>,
	h5: (props) => <h5 className="mb-4 mt-6 text-lg font-bold">{props.children}</h5>,
	h6: (props) => <h6 className="mb-4 mt-6 text-base font-bold">{props.children}</h6>,
	p: (props) => <p className="mb-4 mt-4 text-base">{props.children}</p>,
	img: (props) => (
		<div className="m-3">
			<img className="my-4" {...props} />
		</div>
	),
	a: (props) => {
		const children = props.children;
		if (props.href.startsWith("http")) {
			return <a className="text-primary underline hover:text-primary" target="_blank" {...props}></a>;
		}
		return (
			<Link {...props}>
				<div className="my-1 max-w-max !cursor-pointer rounded-md bg-primary px-3 py-[2px] text-white shadow-sm duration-300 hover:shadow-md">
					{children} ↗
				</div>
			</Link>
		);
	},
};

export const innerAnnouncementScopeList = {
	WEBSITE: [
		{ value: "WEBSITE", text: "Website", description: "", disabled: true },
		{ value: "CHAIR", text: "Chair", description: "", disabled: true },
		{ value: "MANAGER", text: "Manager", description: "", disabled: true },
		{ value: "DELEGATE", text: "Delegate", description: "", disabled: true },
		{ value: "MEMBER", text: "Member", description: "", disabled: true },
		{ value: "SECRETARIAT", text: "Secretariat", description: "", disabled: true },
		{ value: "SCHOOLDIRECTORS", text: "School Directors", description: "", disabled: true },
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
		{ value: "COMMITTEESCHOOLDIRECTORS", text: "School Directors", description: "in Session of Committee", disabled: true },
		{ value: "COMMITTEEDIRECTORS", text: "Directors", description: "viewing Committee", disabled: true },
		{ value: "COMMITTEESENIORDIRECTORS", text: "Senior Directors", description: "viewing Committee", disabled: true },
	],
	COMMITTEESCOPED: [
		{ value: "COMMITTEECHAIR", text: "Chair", description: "of Committee", disabled: false },
		{ value: "COMMITTEEMANAGER", text: "Manager", description: "in Session with Access to Committee", disabled: false },
		{ value: "COMMITTEEDELEGATE", text: "Delegate", description: "in Committee", disabled: false },
		{ value: "COMMITTEEMEMBER", text: "Member", description: "in Session with Access to Committee", disabled: false },
		{ value: "COMMITTEESECRETARIAT", text: "Secretariat", description: "viewing Committee", disabled: false },
		{ value: "COMMITTEESCHOOLDIRECTORS", text: "School Directors", description: "in Session of COmmittee", disabled: false },
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
};

export function authorizedToEditResource(authSession, editResourceData) {
	const isManagement = authorize(authSession, [s.management]);
	const scopeAuthorizationBooleanMap = {
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
			isManagement || authorizeChairCommittee([...authSession?.currentRoles, ...authSession?.pastRoles], editResourceData.committeeId),
		COMMITTEECHAIR: isManagement || authorizeChairCommittee([...authSession?.currentRoles, ...authSession?.pastRoles], editResourceData.committeeId),
		COMMITTEEMANAGER:
			isManagement || authorizeChairCommittee([...authSession?.currentRoles, ...authSession?.pastRoles], editResourceData.committeeId),
		COMMITTEEDELEGATE:
			isManagement || authorizeChairCommittee([...authSession?.currentRoles, ...authSession?.pastRoles], editResourceData.committeeId),
		COMMITTEEMEMBER: isManagement || authorizeChairCommittee([...authSession?.currentRoles, ...authSession?.pastRoles], editResourceData.committeeId),
		COMMITTEESECRETARIAT:
			isManagement || authorizeChairCommittee([...authSession?.currentRoles, ...authSession?.pastRoles], editResourceData.committeeId),
		COMMITTEESCHOOLDIRECTORS:
			isManagement || authorizeChairCommittee([...authSession?.currentRoles, ...authSession?.pastRoles], editResourceData.committeeId),
		COMMITTEEDIRECTORS:
			isManagement || authorizeChairCommittee([...authSession?.currentRoles, ...authSession?.pastRoles], editResourceData.committeeId),
		COMMITTEESENIORDIRECTORS:
			isManagement || authorizeChairCommittee([...authSession?.currentRoles, ...authSession?.pastRoles], editResourceData.committeeId),
		DEPARTMENTWEBSITE:
			isManagement || authorizeManagerDepartment([...authSession?.currentRoles, ...authSession?.pastRoles], editResourceData.departmentId),
		DEPARTMENTMANAGER:
			isManagement || authorizeManagerDepartment([...authSession?.currentRoles, ...authSession?.pastRoles], editResourceData.departmentId),
		DEPARTMENTMEMBER:
			isManagement || authorizeManagerDepartment([...authSession?.currentRoles, ...authSession?.pastRoles], editResourceData.departmentId),
		DEPARTMENTSECRETARIAT:
			isManagement || authorizeManagerDepartment([...authSession?.currentRoles, ...authSession?.pastRoles], editResourceData.departmentId),
		DEPARTMENTDIRECTORS:
			isManagement || authorizeManagerDepartment([...authSession?.currentRoles, ...authSession?.pastRoles], editResourceData.departmentId),
		DEPARTMENTSENIORDIRECTORS:
			isManagement || authorizeManagerDepartment([...authSession?.currentRoles, ...authSession?.pastRoles], editResourceData.departmentId),
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

export default async function Modals({ searchParams }) {
	const authSession = await auth();
	let editResourceData: Resource | null = null;
	let deleteResourceData: Resource | null = null;

	if (searchParams["edit-announcement"]) {
		editResourceData = await prisma.resource.findFirst({
			where: { id: searchParams["edit-resource"] },
			include: { session: true, committee: { include: { session: true } }, department: { include: { session: true } } },
		});

		if (!authorizedToEditResource(authSession, editResourceData)) {
			editResourceData = null;
		}
	}

	if (searchParams["delete-announcement"]) {
		deleteResourceData = await prisma.resource.findFirst({
			where: { id: searchParams["delete-announcement"] },
			include: { session: true, committee: { include: { session: true } }, department: { include: { session: true } } },
		});

		if (!authorizedToEditResource(authSession, deleteResourceData)) {
			deleteResourceData = null;
		}
	}

	return (
		<>
			<ModalDeleteResource selectedResource={deleteResourceData} />
			<ModalEditAnnouncement selectedResource={editResourceData} />
		</>
	);
}
