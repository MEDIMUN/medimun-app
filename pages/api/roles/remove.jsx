import prisma from "../../../prisma/client";
import { getSession } from "next-auth/react";
import { findUserDetails } from "../../../lib/user-operations/user-roles";

export default async function handler(req, res) {
	const session = await getSession({ req: req });
	const roleName = req.body.roleName;
	const roleId = req.body.roleId;
	const organiserUser = await findUserDetails(session.user.userNumber);

	function alredyDeleted(error) {
		if (error.code == "P2025") {
			res.status(200).json({
				title: "Success",
				status: "success",
				description: "Role already removed",
				isClosable: true,
				duration: 5000,
			});
			return;
		}
		if (error) {
			res.status(500).json({
				title: "Error",
				status: "error",
				description: "Something went wrong",
				isClosable: true,
				duration: 5000,
			});
		}
	}

	function success(description) {
		res.status(200).json({
			title: "Success",
			status: "success",
			description: description || "Role removed",
			isClosable: true,
			duration: 5000,
		});
	}

	function unauthorised() {
		res.status(401).json({
			title: "Unauthorized",
			status: "error",
			description: "You are not authorized to remove roles from other users.",
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
		req.method !== "DELETE"
	) {
		unauthorised();
		return;
	}
	if (roleName == "Delegate") {
		try {
			const response = await prisma.delegate.delete({ where: { id: roleId } });
		} catch (error) {
			alredyDeleted(error);
			return;
		}
		success("Delegate role removed");
		return;
	}
	if (roleName == "Chair") {
		try {
			const response = await prisma.chair.delete({ where: { id: roleId } });
		} catch (error) {
			alredyDeleted(error);
			return;
		}
		success("Chair role removed");
		return;
	}
	if (roleName == "Manager") {
		try {
			const response = await prisma.manager.delete({ where: { id: roleId } });
		} catch (error) {
			alredyDeleted(error);
			return;
		}
		success("Manager role removed");
		return;
	}
	if (roleName == "Member") {
		try {
			const response = await prisma.member.delete({ where: { id: roleId } });
		} catch (error) {
			alredyDeleted(error);
			return;
		}
		success("Member role removed");
		return;
	}
	if (roleName == "Deputy Secretary-General") {
		try {
			const response = await prisma.secretariatDeputySecretaryGeneral.delete({ where: { id: roleId } });
		} catch (error) {
			alredyDeleted(error);
			return;
		}
		success("Deputy Secretary-General role removed");
		return;
	}
	if (roleName == "President of the General Assembly") {
		try {
			const response = await prisma.secretariatPresidentOfTheGeneralAssembly.delete({ where: { id: roleId } });
		} catch (error) {
			alredyDeleted(error);
			return;
		}
		success("President of the General Assembly role removed");
		return;
	}
	if (roleName == "Secretary-General") {
		try {
			const response = await prisma.secretariatSecretaryGeneral.delete({ where: { id: roleId } });
		} catch (error) {
			alredyDeleted(error);
			return;
		}
		success("Secretary-General role removed");
		return;
	}
	if (roleName == "School Director") {
		try {
			const response = await prisma.schoolDirector.delete({ where: { id: roleId } });
		} catch (error) {
			alredyDeleted(error);
			return;
		}
		success("School Director role removed");
		return;
	}
	if (roleName == "Senior Director") {
		if (
			organiserUser.highestCurrentRoleName !== "Global Admin" &&
			organiserUser.highestCurrentRoleName !== "Senior Director"
		) {
			unauthorised();
			return;
		}
		try {
			const response = await prisma.seniorDirector.delete({ where: { id: roleId } });
		} catch (error) {
			alredyDeleted(error);
			return;
		}
		success("Senior Director role removed");
		return;
	}
	if (roleName == "Global Admin") {
		if (organiserUser.highestCurrentRoleName !== "Global Admin") {
			unauthorised();
			return;
		}
		try {
			const response = await prisma.globalAdmin.delete({ where: { id: roleId } });
		} catch (error) {
			alredyDeleted(error);
			return;
		}
		success("Global Admin role removed");
		return;
	}
	res.status(500).json({
		title: "Error",
		status: "error",
		description: "Something went wrong",
		isClosable: true,
		duration: 5000,
	});
}
