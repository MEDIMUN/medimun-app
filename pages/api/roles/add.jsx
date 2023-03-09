import prisma from "../../../prisma/client";
import { getSession } from "next-auth/react";
import { findUserDetails } from "../../../lib/user-operations/user-roles";

export default async function handler(req, res) {
	const session = await getSession({ req: req });
	const roleName = req.body.role;
	const userNumber = req.body.userNumber;
	const committeeId = req.body.committeeId;
	const sessionId = req.body.sessionId;
	const peasantUser = await findUserDetails(userNumber);
	const organiserUser = await findUserDetails(session.user.userNumber);

	function alredyAdded(error) {
		if (error) {
			console.log(error);
			return res.status(500).json({
				title: "Error",
				status: "error",
				description: "Something went wrong",
				isClosable: true,
				duration: 5000,
			});
		}
		res.status(200).json({
			status: "warning",
			description: "Role already added",
			isClosable: true,
			duration: 5000,
		});
	}
	function fillAll(message) {
		res.status(200).json({
			status: "error",
			description: message || "Please fill in all required fields",
			isClosable: true,
			duration: 5000,
		});
	}
	function success(description) {
		res.status(200).json({
			title: "Success",
			status: "success",
			description: description || "Role removed",
			isClosable: true,
			duration: 5000,
		});
		return;
	}
	function unauthorised() {
		res.status(401).json({
			title: "Unauthorized",
			status: "error",
			description: "You are not authorized to add roles to other users.",
			isClosable: true,
			duration: 5000,
		});
	}
	if (
		organiserUser.highestCurrentRoleName == "Delegate" ||
		organiserUser.highestCurrentRoleName == "Member" ||
		organiserUser.highestCurrentRoleName == "Applicant" ||
		organiserUser.highestCurrentRoleName == "Alumni" ||
		organiserUser.highestCurrentRoleName == "Guest" ||
		organiserUser.highestCurrentRoleName == "Chair" ||
		organiserUser.highestCurrentRoleName == "Manager" ||
		organiserUser.highestCurrentRoleName == "School Director" ||
		!session ||
		req.method !== "PUT"
	) {
		return unauthorised();
	}
	//
	if (roleName == "Delegate") {
		if (!sessionId || !committeeId) {
			return fillAll();
		}
		try {
			const same = await prisma.delegate.findFirst({ where: { userId: peasantUser.user.id, sessionId: sessionId } });
			if (same) {
				return alredyAdded();
			}
			const response = await prisma.delegate.create({
				data: {
					user: { connect: { id: peasantUser.user.id } },
					committee: { connect: { id: committeeId } },
					session: { connect: { id: sessionId } },
				},
			});
		} catch (error) {
			return alredyAdded(error);
		}
		return success(`${peasantUser.user.officialName} has been given the Delegate role.`);
	}
	//
	if (roleName == "Chair") {
		if (!sessionId || !committeeId) {
			return fillAll();
		}
		try {
			const same = await prisma.chair.findFirst({
				where: { userId: peasantUser.user.id, sessionId: sessionId, committeeId: committeeId },
			});
			if (same) {
				return alredyAdded();
			}
			const response = await prisma.chair.create({
				data: {
					user: { connect: { id: peasantUser.user.id } },
					committee: { connect: { id: committeeId } },
					session: { connect: { id: sessionId } },
				},
			});
		} catch (error) {
			return alredyAdded(error);
		}
		return success(`${peasantUser.user.officialName} has been given the Chair role.`);
	}
	//
	if (roleName == "Manager") {
		if (!sessionId || !committeeId) {
			return fillAll();
		}
		try {
			const same = await prisma.manager.findFirst({
				where: { userId: peasantUser.user.id, sessionId: sessionId, committeeId: committeeId },
			});
			if (same) {
				return alredyAdded();
			}
			const response = await prisma.manager.create({
				data: {
					user: { connect: { id: peasantUser.user.id } },
					committee: { connect: { id: committeeId } },
					session: { connect: { id: sessionId } },
				},
			});
		} catch (error) {
			return alredyAdded(error);
		}
		return success(`${peasantUser.user.officialName} has been given the Manager role.`);
	}
	//
	if (roleName == "Member") {
		if (!sessionId || !committeeId) {
			return fillAll();
		}
		try {
			const same = await prisma.member.findFirst({
				where: { userId: peasantUser.user.id, sessionId: sessionId, committeeId: committeeId },
			});
			if (same) {
				return alredyAdded();
			}
			const response = await prisma.member.create({
				data: {
					user: { connect: { id: peasantUser.user.id } },
					committee: { connect: { id: committeeId } },
					session: { connect: { id: sessionId } },
				},
			});
		} catch (error) {
			return alredyAdded(error);
		}
		return success(`${peasantUser.user.officialName} has been given the Member role.`);
	}
	//
	if (roleName == "Deputy Secretary-General") {
		if (!sessionId) {
			return fillAll();
		}
		if (
			organiserUser.highestCurrentRoleName !== "Global Admin" &&
			organiserUser.highestCurrentRoleName !== "Senior Director"
		) {
			return unauthorised();
		}
		try {
			const same = await prisma.secretariatDeputySecretaryGeneral.findFirst({
				where: { userId: peasantUser.user.id, sessionId: sessionId },
			});
			if (same) {
				return alredyAdded();
			}
			const response = await prisma.secretariatDeputySecretaryGeneral.create({
				data: {
					user: { connect: { id: peasantUser.user.id } },
					session: { connect: { id: sessionId } },
				},
			});
		} catch (error) {
			return alredyAdded(error);
		}
		return success(`${peasantUser.user.officialName} has been given the Deputy Secretary-General role.`);
	}
	//
	if (roleName == "President of the General Assembly") {
		if (!sessionId) {
			return fillAll();
		}
		if (
			organiserUser.highestCurrentRoleName !== "Global Admin" &&
			organiserUser.highestCurrentRoleName !== "Senior Director"
		) {
			return unauthorised();
		}
		try {
			const same = await prisma.secretariatPresidentOfTheGeneralAssembly.findFirst({
				where: { userId: peasantUser.user.id, sessionId: sessionId },
			});
			if (same) {
				return alredyAdded();
			}
			const response = await prisma.secretariatPresidentOfTheGeneralAssembly.create({
				data: {
					user: { connect: { id: peasantUser.user.id } },
					session: { connect: { id: sessionId } },
				},
			});
		} catch (error) {
			return alredyAdded(error);
		}
		return success(`${peasantUser.user.officialName} has been given the President of the General Assembly role.`);
	}
	//
	if (roleName == "Secretary-General") {
		if (!sessionId) {
			return fillAll();
		}
		if (
			organiserUser.highestCurrentRoleName !== "Global Admin" &&
			organiserUser.highestCurrentRoleName !== "Senior Director"
		) {
			return unauthorised();
		}
		try {
			const same = await prisma.secretariatSecretaryGeneral.findFirst({
				where: { userId: peasantUser.user.id, sessionId: sessionId },
			});
			if (same) {
				return alredyAdded();
			}
			const response = await prisma.secretariatSecretaryGeneral.create({
				data: {
					user: { connect: { id: peasantUser.user.id } },
					session: { connect: { id: sessionId } },
				},
			});
		} catch (error) {
			return alredyAdded(error);
		}
		return success(`${peasantUser.user.officialName} has been given the Secretary-General role.`);
	}
	//
	if (roleName == "School Director") {
		if (!sessionId || !committeeId) {
			return fillAll();
		}
		if (
			organiserUser.highestCurrentRoleName !== "Global Admin" &&
			organiserUser.highestCurrentRoleName !== "Senior Director" &&
			organiserUser.highestCurrentRoleName !== "Secretary-General" &&
			organiserUser.highestCurrentRoleName !== "President of the General Assembly"
		) {
			return unauthorised();
		}
		try {
			const same = await prisma.schoolDirector.findFirst({
				where: { userId: peasantUser.user.id, sessionId: sessionId, committeeId: committeeId },
			});
			if (same) {
				return alredyAdded();
			}
			const response = await prisma.schoolDirector.create({
				data: {
					user: { connect: { id: peasantUser.user.id } },
					session: { connect: { id: sessionId } },
					school: { connect: { id: committeeId } },
				},
			});
		} catch (error) {
			return alredyAdded(error);
		}
		return success(`${peasantUser.user.officialName} has been given the School Director role.`);
	}
	//
	if (roleName == "Senior Director") {
		if (
			organiserUser.highestCurrentRoleName !== "Global Admin" &&
			organiserUser.highestCurrentRoleName !== "Senior Director"
		) {
			return unauthorised();
		}
		try {
			const same = await prisma.seniorDirector.findFirst({
				where: { userId: peasantUser.user.id },
			});
			if (same) {
				return alredyAdded();
			}
			const response = await prisma.seniorDirector.create({
				data: { userId: peasantUser.user.id },
			});
		} catch (error) {
			return alredyAdded(error);
		}
		return success(`${peasantUser.user.officialName} has been given the Senior Director role.`);
	}

	if (roleName == "Global Admin") {
		if (organiserUser.highestCurrentRoleName !== "Global Admin") {
			return unauthorised();
		}
		try {
			const same = await prisma.globalAdmin.findFirst({
				where: { userId: await peasantUser.user.id },
			});
			if (same) {
				return alredyAdded();
			}
			const response = await prisma.globalAdmin.create({
				data: { user: { connect: { id: peasantUser.user.id } } },
			});
		} catch (error) {
			return alredyAdded(error);
		}
		return success(`${peasantUser.user.officialName} has been given the Global Admin role.`);
	}
	//
	res.status(500).json({
		title: "Error",
		status: "error",
		description: "Something went wrong",
		isClosable: true,
		duration: 5000,
	});
}
