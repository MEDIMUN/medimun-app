import { getSession } from "next-auth/react";
import CapitaliseEachWord from "../../../lib/capitalise-each-word";
import prisma from "../../../prisma/client";
import { findUserDetails } from "../../../lib/user-operations/user-roles";

export default async function UpdateAccount(req, res) {
	if (req.method !== "PATCH") {
		return;
	}
	const session = await getSession({ req: req });
	if (!session) {
		res.status(401).json({ message: "Not authenticated" });
		return;
	}

	const allowedRoles = ["Global Admin", "Senior Director"];
	const user = findUserDetails(await session.user.userNumber);
	if (!(await user).allRoleNames.some((ai) => allowedRoles.includes(ai))) {
		return;
	}

	const userinfo = req.body;
	let reqOfficialName = CapitaliseEachWord(userinfo.official_name.trim());
	let reqOfficialSurname = CapitaliseEachWord(userinfo.official_surname.trim());
	let reqDisplayName = CapitaliseEachWord(userinfo.display_name.trim()) || "";
	let reqDisplaySurname = CapitaliseEachWord(userinfo.display_surname.trim()) || "";
	let reqDateOfBirth = userinfo.date_of_birth;
	let reqPronounsToggle = userinfo.pronouns_toggle;
	let reqPronoun1 = userinfo.pronoun_1;
	let reqPronoun2 = userinfo.pronoun_2;
	let reqProfileVisibility = userinfo.profile_visibility;
	let reqProfileOrganiserVisibility = userinfo.organiser_profile_visibility;
	let reqShowPhoneNumber = userinfo.show_phone_number;
	let reqAllowPublicMessaging = userinfo.allow_public_messaging;
	let reqDisplayNameToggle = userinfo.display_names_toggle;

	if (reqOfficialName.length > 20) {
		res.status(400).json({
			title: "Official Name Problem",
			description: "Official name is too long",
			status: "error",
			duration: 1250,
			isClosable: true,
		});
		return;
	}

	if (reqOfficialSurname.length > 20) {
		res.status(400).json({
			title: "Official Surname Problem",
			description: "Official surname is too long",
			status: "error",
			duration: 1250,
			isClosable: true,
		});
		return;
	}

	if (reqDisplayName.length > 20) {
		res.status(400).json({
			title: "Display Name Problem",
			description: "Display name is too long",
			status: "error",
			duration: 1250,
			isClosable: true,
		});
		return;
	}

	if (reqDisplaySurname.length > 20) {
		res.status(400).json({
			title: "Display Surname Problem",
			description: "Display surname is too long",
			status: "error",
			duration: 1250,
			isClosable: true,
		});
		return;
	}

	if (reqPronoun1.length > 5) {
		res.status(400).json({
			title: "Pronoun 1 Problem",
			description: "Pronoun is too long",
			status: "error",
			duration: 1250,
			isClosable: true,
		});
		return;
	}

	if (reqPronoun2.length > 5) {
		res.status(400).json({
			title: "Pronoun 2 Problem",
			description: "Pronoun is too long",
			status: "error",
			duration: 1250,
			isClosable: true,
		});
		return;
	}

	if (reqProfileVisibility < 1 || reqProfileVisibility > 6) {
		res.status(400).json({
			title: "Profile Visibility Problem",
			description: "Profile visibility is invalid",
			status: "error",
			duration: 1250,
			isClosable: true,
		});
		return;
	}

	if (reqProfileOrganiserVisibility < 1 || !reqProfileOrganiserVisibility > 2) {
		res.status(400).json({
			title: "Profile Organiser Visibility Problem",
			description: "Profile organiser visibility is invalid",
			status: "error",
			duration: 1250,
			isClosable: true,
		});
		return;
	}

	if (typeof reqShowPhoneNumber != "boolean") {
		res.status(400).json({
			title: "Show Phone Number Problem",
			description: "Show phone number option is invalid",
			status: "error",
			duration: 1250,
			isClosable: true,
		});
		return;
	}

	if (typeof reqAllowPublicMessaging != "boolean") {
		res.status(400).json({
			title: "Allow Public Messaging Problem",
			description: "Allow public messaging option is invalid",
			status: "error",
			duration: 1250,
			isClosable: true,
		});
		return;
	}

	if (reqDateOfBirth != null) {
		if (reqDateOfBirth.length > 10) {
			res.status(400).json({
				title: "Date of Birth Problem",
				description: "Date of birth is invalid",
				status: "error",
				duration: 1250,
				isClosable: true,
			});
			return;
		}
	}

	if (reqDateOfBirth) {
		reqDateOfBirth = new Date(reqDateOfBirth);
	}

	if (reqDisplayNameToggle == false) {
		reqDisplayName = reqOfficialName;
		reqDisplaySurname = reqOfficialSurname;
	}

	let displayNameHolder;
	let displaySurnameHolder;
	if (reqDisplayNameToggle == false) {
		displayNameHolder = "";
		displaySurnameHolder = "";
	} else {
		displayNameHolder = reqDisplayName || user.displayName;
		displaySurnameHolder = reqDisplaySurname || user.displaySurname;
	}

	let pronoun1Holder;
	let pronoun2Holder;

	if (reqPronounsToggle == true) {
		pronoun1Holder = reqPronoun1 || user.pronoun1;
		pronoun2Holder = reqPronoun2 || user.pronoun2;
	} else {
		pronoun1Holder = "";
		pronoun2Holder = "";
	}

	const update = await prisma.user.update({
		where: {
			userNumber: user.userNumber,
		},
		data: {
			officialName: reqOfficialName || user.officialName,
			officialSurname: reqOfficialSurname || user.officialSurname,
			displayName: displayNameHolder,
			displaySurname: displaySurnameHolder,
			dateOfBirth: reqDateOfBirth || user.dateOfBirth,
			pronoun1: pronoun1Holder,
			pronoun2: pronoun2Holder,
			profileVisibility: parseInt(reqProfileVisibility) || user.profileVisibility,
			organiserProfileVisibility: parseInt(reqProfileOrganiserVisibility) || user.organiserProfileVisibility,
			showPhoneNumber: reqShowPhoneNumber || user.showPhoneNumber,
			allowMessagesFromEveryone: reqAllowPublicMessaging || user.allowPublicMessaging,
		},
	});

	if (update) {
		res.status(200).json({
			title: "Success",
			description: "Profile updated successfully",
			status: "success",
			duration: 1250,
			isClosable: true,
		});
		return;
	}

	res.status(200).json({ message: "Success" });
	return;
}
