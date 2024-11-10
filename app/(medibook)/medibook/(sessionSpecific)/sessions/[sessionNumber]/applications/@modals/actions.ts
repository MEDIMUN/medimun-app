"use server";

import { auth } from "@/auth";
import { countries } from "@/data/countries";
import {
	sendEmailAcceptSchoolDirectorApplication,
	sendEmailAssignDelegateToCommittee,
	sendEmailRejectSchoolDirectorApplication,
	sendEmailSchoolInvoice,
	sendEmailYourDelegatesHaveBeenAssigned,
} from "@/email/send";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { getSocketInstance } from "@/socket/server";
import { unstable_after as after } from "next/server";
import { sortProposal } from "../assignment/page";

export async function approveSchoolDirectorApplication(applicationId: string) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	if (!isManagement) return { ok: false, message: "Unauthorized" };

	let selectedApplication: any;

	try {
		selectedApplication = await prisma.applicationSchoolDirector.findUnique({
			where: { id: applicationId },
			include: { school: true, session: true, user: { include: { schoolDirector: { include: { school: true, session: true } } } } },
		});
	} catch (error) {
		return { ok: false, message: "Application not found" };
	}

	if (!selectedApplication) return { ok: false, message: "Application not found" };
	if (selectedApplication.isApproved) return { ok: false, message: "Application already approved" };
	if (!selectedApplication.session.isCurrent) return { ok: false, message: "Session is not current" };

	if (selectedApplication.user.schoolDirector.find((role: { session: { isCurrent: any } }) => role.session.isCurrent))
		return { ok: false, message: "User is already a school director in the current session. Please delete the application." };

	try {
		await prisma.$transaction([
			prisma.applicationSchoolDirector.update({
				where: { id: applicationId },
				data: { isApproved: true },
			}),
			prisma.schoolDirector.create({
				data: {
					user: { connect: { id: selectedApplication.userId } },
					school: { connect: { id: selectedApplication.schoolId } },
					session: { connect: { id: selectedApplication.sessionId } },
				},
			}),
		]);
	} catch (error) {
		return { ok: false, message: "Something went wrong." };
	}
	try {
		await sendEmailAcceptSchoolDirectorApplication({
			email: selectedApplication.user.email,
			officialName: selectedApplication.user.officialName,
			officialSurname: selectedApplication.user.officialSurname,
			applicationId: selectedApplication.id,
		});
	} catch (error) {
		return { ok: false, message: "Application approved but the email notification could not be sent." };
	}
	return { ok: true, message: "Application approved and email notification sent." };
}

export async function deleteSchoolDirectorApplication(applicationId: string) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	if (!isManagement) return { ok: false, message: "Unauthorized" };

	let selectedApplication: any;

	try {
		selectedApplication = await prisma.applicationSchoolDirector.findUnique({
			where: { id: applicationId },
			include: { school: true, session: true, user: { include: { schoolDirector: { include: { school: true, session: true } } } } },
		});
	} catch (error) {
		return { ok: false, message: "Application not found." };
	}

	if (!selectedApplication) return { ok: false, message: "Application not found" };
	if (selectedApplication.isApproved) return { ok: false, message: "Application already approved" };
	if (!selectedApplication.session.isCurrent) return { ok: false, message: "Session is not current" };

	try {
		await prisma.applicationSchoolDirector.delete({
			where: { id: applicationId },
		});
	} catch (error) {
		return { ok: false, message: "Something went wrong." };
	}
	try {
		await sendEmailRejectSchoolDirectorApplication({
			email: selectedApplication.user.email,
			officialName: selectedApplication.user.officialName,
			officialSurname: selectedApplication.user.officialSurname,
			applicationId: selectedApplication.id,
		});
	} catch (error) {
		return { ok: false, message: "Application deleted but the email notification could not be sent." };
	}
	return { ok: true, message: "Application deleted and email notification sent." };
}

export async function approveSchoolDelegateAssignmentProposal(proposalId: string) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);
	if (!isManagement) return { ok: false, message: ["Unauthorized"] };
	const io = getSocketInstance();

	const selectedAssignmentProposal = await prisma.schoolDelegationProposal.findUnique({
		where: { id: proposalId },
		include: { session: { include: { committee: true } }, school: { include: { director: { include: { user: true } } } } },
	});

	if (!selectedAssignmentProposal) {
		return { ok: false, message: ["Proposal not found"] };
	}

	const grantedCountries = await prisma.applicationGrantedDelegationCountries.findFirst({
		where: { schoolId: selectedAssignmentProposal?.schoolId, sessionId: selectedAssignmentProposal?.sessionId },
	});

	if (!grantedCountries) return { ok: false, message: ["No granted countries found"] };

	const allGeneralAssemblyCommittees = selectedAssignmentProposal?.session.committee.filter((c) => c.type === "GENERALASSEMBLY");
	const numberOFGAcommittees = allGeneralAssemblyCommittees?.length || 0;

	const allGrantedCountryCodes = grantedCountries?.countries;

	const selectedAssignmentJSON = selectedAssignmentProposal?.changes || selectedAssignmentProposal?.assignment || "";

	let parsedSelectedAssignment;
	try {
		parsedSelectedAssignment = sortProposal(JSON.parse(selectedAssignmentJSON), selectedAssignmentProposal?.session.committee);
	} catch (error) {
		parsedSelectedAssignment = [];
	}

	const countriesInAssignment = parsedSelectedAssignment.map((a) => a.countryCode).filter((x) => x);

	const allUserIds = parsedSelectedAssignment.map((a) => a.studentId).filter((x) => x);
	const selectedUsers = await prisma.user.findMany({
		where: { id: { in: allUserIds } },
	});

	for (const user of selectedUsers) {
		if (selectedAssignmentProposal?.schoolId !== user.schoolId) {
			return { ok: false, message: ["One of the users is not a student in the school"] };
		}
	}

	if (!selectedAssignmentProposal) return { ok: false, message: ["Proposal not found"] };

	if (countriesInAssignment.some((c) => !allGrantedCountryCodes.includes(c))) {
		return { ok: false, message: ["One of the countries in the assignment is not granted to the school"] };
	}

	//THERE SHOULD BE MAX <NUMBEROFGACOMMITTEES> DELEGATES ASSIGNED TO A SINGLE COUNTRY
	for (const countryCode of allGrantedCountryCodes) {
		const delegatesAssignedToCountry = parsedSelectedAssignment.filter((a) => a.countryCode === countryCode);
		if (delegatesAssignedToCountry.length > numberOFGAcommittees) {
			return { ok: false, message: ["Too many delegates assigned to a single country"] };
		}
	}

	//ASSIGNMENTS WITHOUT COUNTRY CODE SHOULD BE OF COMMITTEES OTHER THAN GA
	for (const assignment of parsedSelectedAssignment) {
		const committee = selectedAssignmentProposal?.session.committee.find((c) => c.id === assignment.committeeId);

		if (!assignment.countryCode && committee?.type === "GENERALASSEMBLY") {
			return { ok: false, message: ["Assignments without a country code should be of committees other than GA"] };
		}
	}

	const allSchoolDirectors = await prisma.schoolDirector.findMany({
		where: { schoolId: selectedAssignmentProposal?.schoolId, sessionId: selectedAssignmentProposal?.sessionId },
		include: { user: true },
	});

	const approvedSchoolDirectorApplications = await prisma.applicationSchoolDirector.findMany({
		where: { schoolId: selectedAssignmentProposal?.schoolId, sessionId: selectedAssignmentProposal?.sessionId, isApproved: true },
	});

	const numberOfApprovedSchoolDirectorApplications = approvedSchoolDirectorApplications.length || 0;

	let errorDelegatesAssigned = false,
		errorSchoolInvoice = false;

	const invoiceObject = [
		{
			description: "School Director Fee",
			price: selectedAssignmentProposal?.session.directorPrice || 0,
			quantity: numberOfApprovedSchoolDirectorApplications,
		},
		{
			description: "Delegate Fee",
			price: selectedAssignmentProposal?.session.delegatePrice || 0,
			quantity: parsedSelectedAssignment.length,
		},
	];

	try {
		await prisma.$transaction(async (tx) => {
			await tx.finalDelegation.create({
				data: {
					schoolId: selectedAssignmentProposal?.schoolId,
					sessionId: selectedAssignmentProposal?.sessionId,
					delegation: JSON.stringify(parsedSelectedAssignment),
				},
			});
			parsedSelectedAssignment.map(async (assignment) => {
				await tx.delegate.create({
					data: {
						committeeId: assignment.committeeId,
						userId: assignment.studentId,
						country: assignment.countryCode,
					},
				});
			});
			await tx.schoolDelegationProposal.delete({
				where: { id: proposalId },
			});
			await tx.invoice.create({
				data: {
					schoolId: selectedAssignmentProposal?.schoolId,
					sessionId: selectedAssignmentProposal?.sessionId,
					description: "Delegation Fee",
					isPaid: false,
					items: JSON.stringify(invoiceObject),
				},
			});
		});
	} catch (error) {
		errorDelegatesAssigned = true;
		errorSchoolInvoice = true;
		return { ok: false, message: ["Something went wrong"] };
	}

	if (!errorDelegatesAssigned) {
		after(async () => {
			const emailPromises = parsedSelectedAssignment.map(async (assignment) => {
				const user = selectedUsers.find((u) => u.id === assignment.studentId);
				const committee = selectedAssignmentProposal?.session.committee.find((c) => c.id === assignment.committeeId);
				const countryName = assignment.countryCode ? countries.find((c) => c.countryCode === assignment.countryCode)?.countryNameEn : null;

				if ((user?.officialName || user?.displayName) && user?.email && committee?.name) {
					return sendEmailAssignDelegateToCommittee({
						officialName: user.displayName?.split(" ")[0] || user?.officialName,
						email: user?.email,
						committeeName: committee?.name,
						country: countryName || null,
					}).catch(() => {});
				}
			});

			await Promise.all(emailPromises);

			io
				?.to(`private-user-${authSession?.user.id}`)
				.emit("toast.info", `Delegates of ${selectedAssignmentProposal?.school.name} have been notified of their assignments via email.`);
		});
	}

	if (!errorSchoolInvoice && allSchoolDirectors.length) {
		after(async () => {
			const emailPromises = allSchoolDirectors.flatMap((director) => {
				const { officialName, displayName, email } = director.user;
				return [
					sendEmailYourDelegatesHaveBeenAssigned({
						officialName: displayName?.split(" ")[0] || officialName,
						email,
						schoolName: selectedAssignmentProposal?.school.name,
					}).catch(() => {}),

					sendEmailSchoolInvoice({
						officialName: displayName?.split(" ")[0] || officialName,
						email,
						schoolName: selectedAssignmentProposal?.school.name,
					}).catch(() => {}),
				];
			});

			await Promise.all(emailPromises);

			io
				?.to(`private-user-${authSession?.user.id}`)
				.emit(
					"toast.info",
					`School Directors of ${selectedAssignmentProposal?.school.name} have been notified of their student assignments and school invoice via email.`
				);
		});
	}

	return { ok: true, message: ["Delegates assigned and invoice created"] };
}
