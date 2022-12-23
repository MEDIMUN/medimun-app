import { getSession } from "next-auth/react";
import CapitaliseEachWord from "../../../lib/capitalise-each-word";

export default async function UpdateAccount(req, res) {
	if (req.method === "PATCH") {
		const session = await getSession({ req: req });
		if (!session) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		console.log(session);

		const user = await prisma.user.findFirst({
			where: {
				userNumber: await session.user.userNumber,
			},
		});

		console.log(req.body);
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
			res.status(400).json({ title: "Official Name Problem", description: "Official name is too long", status: "error", duration: 1250, isClosable: true });
			return;
		}

		if (reqOfficialSurname.length > 20) {
			res
				.status(400)
				.json({ title: "Official Surname Problem", description: "Official surname is too long", status: "error", duration: 1250, isClosable: true });
			return;
		}

		if (reqDisplayName.length > 20) {
			res.status(400).json({ title: "Display Name Problem", description: "Display name is too long", status: "error", duration: 1250, isClosable: true });
			return;
		}

		if (reqDisplaySurname.length > 20) {
			res.status(400).json({ title: "Display Surname Problem", description: "Display surname is too long", status: "error", duration: 1250, isClosable: true });
			return;
		}

		if (reqPronoun1.length > 5) {
			res.status(400).json({ title: "Pronoun 1 Problem", description: "Pronoun is too long", status: "error", duration: 1250, isClosable: true });
			return;
		}

		if (reqPronoun2.length > 5) {
			res.status(400).json({ title: "Pronoun 2 Problem", description: "Pronoun is too long", status: "error", duration: 1250, isClosable: true });
			return;
		}

		if (reqProfileVisibility < 1 || reqProfileVisibility > 6) {
			res
				.status(400)
				.json({ title: "Profile Visibility Problem", description: "Profile visibility is invalid", status: "error", duration: 1250, isClosable: true });
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
			res
				.status(400)
				.json({ title: "Show Phone Number Problem", description: "Show phone number option is invalid", status: "error", duration: 1250, isClosable: true });
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
		console.log(reqDisplayNameToggle);
		if (reqDisplayNameToggle == false) {
			displayNameHolder = "";
			displaySurnameHolder = "";
		} else {
			displayNameHolder = reqDisplayName || user.display_name;
			displaySurnameHolder = reqDisplaySurname || user.display_surname;
		}

		let pronoun1Holder;
		let pronoun2Holder;

		if (reqPronounsToggle == true) {
			pronoun1Holder = reqPronoun1 || user.pronoun_1;
			pronoun2Holder = reqPronoun2 || user.pronoun_2;
		} else {
			pronoun1Holder = "";
			pronoun2Holder = "";
		}

		const update = await prisma.user.update({
			where: {
				userNumber: user.userNumber,
			},
			data: {
				official_name: reqOfficialName || user.official_name,
				official_surname: reqOfficialSurname || user.official_surname,
				display_name: displayNameHolder,
				display_surname: displaySurnameHolder,
				date_of_birth: reqDateOfBirth || user.date_of_birth,
				pronoun1: pronoun1Holder,
				pronoun2: pronoun2Holder,
				profileVisibility: parseInt(reqProfileVisibility) || user.profile_visibility,
				OrganiserProfileVisibility: parseInt(reqProfileOrganiserVisibility) || user.organiser_profile_visibility,
				show_phone_number: reqShowPhoneNumber || user.show_phone_number,
				allow_messages_from_everyone: reqAllowPublicMessaging || user.allow_public_messaging,
			},
		});

		if (update) {
			res.status(200).json({ title: "Success", description: "Profile updated successfully", status: "success", duration: 1250, isClosable: true });
			return;
		}

		res.status(200).json({ message: "Success" });
		return;
	}
}
