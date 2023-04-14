import Layout from "../../app-components/layout";
import { Avatar, Input, Text, Switch, Stack, Radio, RadioGroup, Select } from "@chakra-ui/react";
import style from "../../styles/account.module.css";
import { getSession } from "next-auth/react";
import { Image, Spacer } from "@nextui-org/react";
import { BeatLoader, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Lorem, ModalFooter } from "@chakra-ui/react";
import { useState, useRef, Fragment, use, Children } from "react";
import { useDisclosure, useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import axios, { AxiosRequestConfig } from "axios";
import ProfileBanner from "../../app-components/ProfileBanner";
import { findUserDetails } from "@lib/user-roles";
import { useEffect } from "react";
import { useFirstRender } from "../../hooks/useFirstRender";
import post from "@lib/post";
import { countryCodesAndNames } from "../../data/countries";

import { capitaliseEachWord } from "../../lib/capitalise-each-word";

const disallowedCharacters = ["#", "/", "(", ")", "@", "--", "[", "]", "{", "}", ":", ";", ".", ",", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function AccountPage(props) {
	console.log(props.user.pastRoles);
	console.log(props.user.currentRoles);
	const router = useRouter();
	const firstRender = useFirstRender();
	const toast = useToast();
	const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
	const schools = [{ schoolName: "Other", schoolCode: "" }, ...props.schools];
	const getFlagEmoji = (countryCode = "UN") => String.fromCodePoint(...[...countryCode.toUpperCase()].map((x) => 0x1f1a5 + x.charCodeAt()));

	/** PAGE COMPONENTS */
	function profileVisibilityRadio(value, title, description) {
		return (
			<div className={profileVisibility == value ? style.selectedRadio : style.deselectedRadio}>
				<Radio className={style.radio} value={value} defaultChecked>
					<strong>{title}</strong>
					<h3 borderBottom="2.5px solid #FFF" paddingLeft="24px">
						{description}
					</h3>
				</Radio>
			</div>
		);
	}

	const title = (title, description) => {
		return (
			<Fragment>
				<Text marginLeft="15px" fontFamily="sans-serif" fontWeight="500">
					<strong>{title}</strong>
					{description && <br />}
					{description}
				</Text>
			</Fragment>
		);
	};

	/** NOTIFS */
	function timedOut() {
		toast({
			title: "You are not connected to the internet",
			status: "error",
			duration: 10000,
			isClosable: true,
			position: "top",
		});
	}

	function NameInput(title, description, inputValue, onChange, inputIsDisabled, buttonIsDisabled, buttonIsLoading, buttonOnClick, buttonText, type, placeholder) {
		return (
			<Fragment>
				<Fragment>
					<Text marginLeft="15px" fontFamily="sans-serif" fontWeight="500">
						<strong>{title}</strong>
						{description && <br />}
						{description}
					</Text>
				</Fragment>{" "}
				<div className="fdr">
					<Input value={inputValue} onChange={onChange} isDisabled={inputIsDisabled} type={type} placeholder={placeholder} variant="filled" width="calc(100%)" />
					<Button isDisabled={buttonIsDisabled} isLoading={buttonIsLoading} onClick={buttonOnClick} ml={2}>
						{buttonText}
					</Button>
				</div>
			</Fragment>
		);
	}

	/** PAGE STATE */

	/** OFFICIAL NAME STATE */
	const [officialName, setOfficialName] = useState(props.user.officialName);
	const [disableOfficialName, setDisableOfficialName] = useState(true);
	const [previousOfficialName, setPreviousOfficialName] = useState(props.user.officialName);
	const [officislNameLoading, setOfficialNameLoading] = useState(false);
	const [officialNameButtonText, setOfficialNameButtonText] = useState("Edit");
	const [officialNameButtonDisabled, setOfficialNameButtonDisabled] = useState(false);

	const handleOfficialNameChange = (event) => setOfficialName(capitaliseEachWord(event.target.value, 25, disallowedCharacters));

	async function updateOfficialName() {
		if (disableOfficialName) {
			setDisableOfficialName(false);
			setOfficialNameButtonText("Save");
		} else {
			setDisableOfficialName(true);
			setOfficialNameLoading(true);
			try {
				const res = await fetch("/api/user/update-official-name", {
					method: "PATCH",
					body: JSON.stringify({
						userNumber: props.user.id,
						officialName: capitaliseEachWord(officialName).trim(),
					}),
					signal: AbortSignal.timeout(5000),
				});
				if (res.status == 200) {
					setDisableOfficialName(true);
					setPreviousOfficialName(capitaliseEachWord(officialName).trim());
					setOfficialNameLoading(false);
					setOfficialNameButtonText("Edit");
					return;
				}
			} catch (e) {
				if (e.name === "AbortError") {
					timedOut();
				}
				setDisableOfficialName(true);
				setOfficialName(capitaliseEachWord(previousOfficialName).trim());
				setOfficialNameLoading(false);
				setOfficialNameButtonText("Edit");
			}
		}
	}

	useEffect(() => {
		if (firstRender) return;
		if (officialName.length < 2) {
			setOfficialNameButtonText("Name Too Short");
			setOfficialNameButtonDisabled(true);
		} else {
			setOfficialNameButtonDisabled(false);
			if (disableOfficialName) return;
			setOfficialNameButtonText("Save");
		}
	}, [officialName]);
	/** END OF OFFICIAL NAME STATE */

	/** OFFICIAL SURNAME STATE */
	const [officialSurname, setOfficialSurname] = useState(props.user.officialSurname);
	const [disableOfficialSurname, setDisableOfficialSurname] = useState(true);
	const [previousOfficialSurname, setPreviousOfficialSurname] = useState(props.user.officialSurname);
	const [officialSurnameLoading, setOfficialSurnameLoading] = useState(false);
	const [officialSurnameButtonText, setOfficialSurnameButtonText] = useState("Edit");
	const [officialSurnameButtonDisabled, setOfficialSurnameButtonDisabled] = useState(false);

	const handleOfficialSurnameChange = (event) => setOfficialSurname(capitaliseEachWord(event.target.value, 25, disallowedCharacters));

	async function updateOfficialSurname() {
		if (disableOfficialSurname) {
			setDisableOfficialSurname(false);
			setOfficialSurnameButtonText("Save");
		} else {
			setDisableOfficialSurname(true);
			setOfficialSurnameLoading(true);
			try {
				const res = await fetch("/api/user/update-official-surname", {
					method: "PATCH",
					body: JSON.stringify({
						userNumber: props.user.id,
						officialName: capitaliseEachWord(officialSurname).trim(),
					}),
					signal: AbortSignal.timeout(5000),
				});
				if (res.status == 200) {
					setDisableOfficialSurname(true);
					setPreviousOfficialSurname(capitaliseEachWord(officialSurname, 25).trim());
					setOfficialSurnameLoading(false);
					setOfficialSurnameButtonText("Edit");
					return;
				}
			} catch (e) {
				if (e.name === "AbortError") {
					timedOut();
				}
				setDisableOfficialSurname(true);
				setOfficialSurname(capitaliseEachWord(previousOfficialSurname, 25).trim());
				setOfficialSurnameLoading(false);
				setOfficialSurnameButtonText("Edit");
			}
		}
	}

	useEffect(() => {
		if (firstRender) return;
		if (officialSurname.length < 2) {
			setOfficialSurnameButtonText("Name Too Short");
			setOfficialSurnameButtonDisabled(true);
		} else {
			setOfficialSurnameButtonDisabled(false);
			if (disableOfficialSurname) return;
			setOfficialSurnameButtonText("Save");
		}
	}, [officialSurname]);

	/** DISPLAY NAME STATE */
	const [displayName, setDisplayName] = useState(props.user.displayName);
	const [disableDisplayName, setDisableDisplayName] = useState(true);
	const [previousDisplayName, setPreviousDisplayName] = useState(props.user.displayName);
	const [displayNameLoading, setDisplayNameLoading] = useState(false);
	const [displayNameButtonText, setDisplayNameButtonText] = useState("Edit");
	const [displayNameButtonDisabled, setDisplayNameButtonDisabled] = useState(false);

	const handleDisplaynameChange = (event) => setDisplayName(capitaliseEachWord(event.target.value));

	async function updateDisplayName() {
		if (disableDisplayName) {
			setDisableDisplayName(false);
			setDisplayNameButtonText("Save");
		} else {
			setDisableDisplayName(true);
			setDisplayNameLoading(true);
			try {
				const res = await fetch("/api/user/update-display-name", {
					method: "PATCH",
					body: JSON.stringify({
						userNumber: props.user.id,
						displayName: capitaliseEachWord(displayName).trim(),
					}),
					signal: AbortSignal.timeout(5000),
				});
				if (res.status == 200) {
					setDisableDisplayName(true);
					setPreviousDisplayName(capitaliseEachWord(displayName, 25).trim());
					setDisplayNameLoading(false);
					setDisplayNameButtonText("Edit");
					return;
				}
			} catch (e) {
				if (e.name === "AbortError") {
					timedOut();
				}
				console.log(e);
				setDisableDisplayName(true);
				setDisplayName(capitaliseEachWord(previousDisplayName, 25).trim());
				setDisplayNameLoading(false);
				setDisplayNameButtonText("Edit");
			}
		}
	}

	/** SCHOOL STATE */
	const [school, setSchool] = useState(props.user.school);
	const [disableSchool, setDisableSchool] = useState(true);
	const [previousSchool, setPreviousSchool] = useState(props.user.school);
	const [schoolLoading, setSchoolLoading] = useState(false);
	const [schoolButtonText, setSchoolButtonText] = useState("Edit");

	const handleSchoolChange = (event) => setSchool(event.target.value);

	/** NATIONALITY STATE */
	const [natioality, setNationality] = useState(props.user.nationality);
	const [disableNationality, setDisableNationality] = useState(true);
	const [previousNationality, setPreviousNationality] = useState(props.user.nationality);
	const [nationalityLoading, setNationalityLoading] = useState(false);
	const [nationalityButtonText, setNationalityButtonText] = useState("Edit");

	const handleNationalityChange = (event) => setNationality(event.target.value);

	/** GENDER STATE */
	const [gender, setGender] = useState(props.user.gender);
	const [disableGender, setDisableGender] = useState(true);
	const [previousGender, setPreviousGender] = useState(props.user.gender);

	const handleGenderChange = (event) => setGender(event.target.value);

	/** PRONOUN 1 STATE */
	const [pronoun1, setPronoun1] = useState(props.user.pronoun1);
	const [disablePronoun1, setDisablePronoun1] = useState(true);
	const [previousPronoun1, setPreviousPronoun1] = useState(props.user.pronoun1);

	const handlePronoun1Change = (event) => setPronoun1(event.target.value);

	/** PRONOUN 2 STATE */
	const [pronoun2, setPronoun2] = useState(props.user.pronoun2);
	const [disablePronoun2, setDisablePronoun2] = useState(true);
	const [previousPronoun2, setPreviousPronoun2] = useState(props.user.pronoun2);

	const handlePronoun2Change = (event) => setPronoun2(event.target.value);

	/** DATE OF BIRTH STATE */
	const [dateOfBirth, setDateOfBirth] = useState(props.user.dateOfBirth);
	const [disableDateOfBirth, setDisableDateOfBirth] = useState(true);
	const [previousDateOfBirth, setPreviousDateOfBirth] = useState(props.user.dateOfBirth);

	const handleDateOfBirthChange = (event) => setDateOfBirth(event.target.value);

	/** PROFILE VISIBILITY STATE */
	const [profileVisibility, setProfileVisibility] = useState(props.user.profileVisibility);
	const [disableProfileVisibility, setDisableProfileVisibility] = useState(false);
	const [previousProfileVisibility, setPreviousProfileVisibility] = useState(props.user.profileVisibility);

	useEffect(() => {
		const updateProfileVisibility = async () => {
			setDisableProfileVisibility(true);
			try {
				res = await post("/api/user/update-profile-visibility", { timeout: 2000, profileVisibility: profileVisibility }, (res) => {
					if (res.status == 200) {
						setDisableProfileVisibility(false);
						setPreviousProfileVisibility(profileVisibility);
					}
				});
			} catch (err) {
				setDisableProfileVisibility(false);
				setProfileVisibility(previousProfileVisibility);
			}
		};
		if (!firstRender && previousProfileVisibility !== profileVisibility) {
			updateProfileVisibility();
		}
	}, [profileVisibility]);

	/** PROFILE PICTURE STATE */
	const [profilePicture, setProfilePicture] = useState(props.user.profilePicture);
	const [disableProfilePicture, setDisableProfilePicture] = useState(true);
	const [previousProfilePicture, setPreviousProfilePicture] = useState(props.user.profilePicture);
	const profile_picture_ref = useRef(null);

	/** PROFILE BANNER STATE */
	const [profileBanner, setProfileBanner] = useState(props.user.profileBanner);
	const [disableProfileBanner, setDisableProfileBanner] = useState(true);
	const [previousProfileBanner, setPreviousProfileBanner] = useState(props.user.profileBanner);
	const profile_banner_ref = useRef(null);

	return (
		<Layout className={style.page}>
			<div className={style.banner}>
				<ProfileBanner name={props.user.displayName || props.user.officialName + " " + props.user.officialSurname} school={props.user.school} country={props.user.nationality} role={props.user.highestCurrentRoleName} />
			</div>
			{title("PROFILE OPTIONS")}
			<div className={style.category}>
				{title("PROFILE PICTURE", "An official looking portrait of yourself")}
				<div className={style.uploadButtons}>
					<Input placeholder="Upload" className={style.uploadButton} backgroundColor="#EDF2F7" type="file" />
					<Button>Upload & Save</Button>
					<Button>Remove</Button>
				</div>
				<Spacer />
				{title("PROFILE BANNER")}
				<div className={style.uploadButtons}>
					<Input className={style.uploadButton} backgroundColor="#EDF2F7" type="file" />
					<Button>Upload & Save</Button>
					<Button>Remove</Button>
				</div>
			</div>
			{title("PERSONAL INFORMATION")}
			<div className={style.category}>
				{NameInput("OFFICIAL FIRSTNAME", "Will be used on your certificate, must match the name on your passport", officialName, handleOfficialNameChange, disableOfficialName, officialNameButtonDisabled, officislNameLoading, updateOfficialName, officialNameButtonText)}
				{NameInput("OFFICIAL SURNAME", "Will be used on your certificate, must match the name on your passport", officialSurname, handleOfficialSurnameChange, disableOfficialSurname, officialSurnameButtonDisabled, officialSurnameLoading, updateOfficialSurname, officialSurnameButtonText)}
			</div>
			<div className={style.category}>
				{NameInput("DISPLAY NAME", "Will be used on your nametag and profile, leave empty if not applicable", displayName, handleDisplaynameChange, disableDisplayName, displayNameButtonDisabled, displayNameLoading, updateDisplayName, displayNameButtonText)}
				{title("PRONOUNS", "Will be used on your nametag and profile, leave empty if not applicable")}
				<div className="fdr">
					<Input value={pronoun1} onChange={handlePronoun1Change} placeholder="PRONOUN 1" isDisabled={disablePronoun1} maxLength="5" borderRadius="5px 0 0 5px" variant="filled" width="calc(50%)" borderRight="2px solid #e2e8f0" />
					<Input value={pronoun2} onChange={handlePronoun2Change} placeholder="PRONOUN 2" isDisabled={disablePronoun2} maxLength="5" borderRadius="0 5px 5px 0" variant="filled" width="calc(50%)" />
					<Button ml={2}>Edit</Button>
				</div>
				{title("GENDER")}
				<div className="fdr">
					<Select value={natioality} disabled={disableNationality} defaultValue="" variant="filled" width="calc(100%)" size="md" type="date">
						<option value="Male">Male</option>
						<option value="Female">Female</option>
						<option value="Non-Binary">Non-Binary</option>
						<option value="Other">Other</option>
						<option value="">Prefer not to say</option>
					</Select>
					<Button ml={2}>Edit</Button>
				</div>
			</div>
			<div className={style.category}>
				{title("DATE OF BIRTH", "Will be used to determine your age group, must match the date of birth on your passport")}

				<div className="fdr">
					<Input value={dateOfBirth} onChange={handleDateOfBirthChange} disabled={disableDateOfBirth} variant="filled" width="calc(100%)" placeholder="Select Date and Time" size="md" type="date" />
					<Button ml={2}>Edit</Button>
				</div>

				{title("NATIONALITY")}
				<div className="fdr">
					<Select onChange={handleNationalityChange} value={natioality} /**disabled={disableNationality}*/ variant="filled" width="calc(100%)" size="md" type="date">
						{props.countries.map((country) => {
							return (
								<option key={country.countryCode} value={country.countryCode}>
									{getFlagEmoji(country.countryCode)} {country.countryName}
								</option>
							);
						})}
					</Select>
					<Button ml={2}>Edit</Button>
				</div>
			</div>
			<div>
				{title("SCHOOL SETTINGS")}
				<div className={style.category}>
					{title("SELECT SCHOOL")}
					<div className="fdr">
						<Select onChange={handleNationalityChange} value={natioality} disabled={disableNationality} variant="filled" width="calc(100%)" size="md" type="date">
							{schools.map((school) => {
								return (
									<option key={school.schoolCode} value={school.schoolCode}>
										{school.schoolName}
									</option>
								);
							})}
						</Select>
						<Button ml={2}>Edit</Button>
					</div>
				</div>
				<div className={style.category}>
					{title("CHANGE SCHOOL", "To change your school you must leave your current school and then join a new one. To complete this action while being enrolled in the current session please contact us.")}
					<Button color="red" mt="5px" ml="10px">
						LEAVE SCHOOL
					</Button>
				</div>
				<div className={style.category}>
					{title("REMOVE FROM SCHOOL", "If you don't recognise this student, you can remove them from the school you manage. You won't be able to undo this action.")}
					<Button color="red" mt="5px" ml="10px">
						{`REMOVE ${props.user.officialName.toUpperCase()} ${props.user.officialSurname.toUpperCase()} FROM ${school.toUpperCase() || "SCHOOL"}`}
					</Button>
				</div>
			</div>
			<div>
				{title("ROLES & AWARDS")}
				<div className={style.category}>{title("ROLES")}</div>
				<div className={style.category}>{title("AWARDS")}</div>
			</div>

			<div>
				{title("PRIVACY SETTINGS")}
				<div className={style.category}>
					{title("SHOW PHONE NUMBER TO CHAIR")}
					<div className={style.switch}>
						<Spacer x={1} />
						<Switch size="lg" />
						<Text marginLeft="14px">If turned off, only higher management will be able to see your phone number.</Text>
					</div>
				</div>
				<div className={style.category}>
					{title("ALLOW DIRECT MESSAGING")}
					<div className={style.switch}>
						<Spacer x={1} />
						<Switch onChange={() => set_allow_public_messaging(!allow_public_messaging)} size="lg" />
						<Text marginLeft="14px">If turned on, only people enrolled in the current session of MEDIMUN will be able to message you.</Text>
					</div>
				</div>
				<div className={style.category}>
					{title("PROFILE VISIBILITY", "Your choice may be disregarded if you are enrolled in the current session")}
					<RadioGroup isDisabled={disableProfileVisibility} onChange={setProfileVisibility} value={profileVisibility} backgroundColor="#EDF2F7" borderRadius="5px" padding="10px" marginLeft="4px">
						{profileVisibilityRadio("1", "Public Profile", "Everyone with or without an account will be able to see your profile.")}
						{profileVisibilityRadio("2", "Internal Only Profile", "Only people with an account will be able to see your profile.")}
						{profileVisibilityRadio("3", "Session Only Profile", "Only people enrolled in the current session will be able to see your profile.")}
						{profileVisibilityRadio("4", "Committee Only Profile", "Only people in your current committee will be able to see your profile.")}
						{profileVisibilityRadio("5", "Verified User Only Profile", "Only people who have attended the conference will be able to see your profile.")}
						{profileVisibilityRadio("6", "Private Profile", "Only you will be able to see your profile.")}
					</RadioGroup>
				</div>
			</div>
		</Layout>
	);
}

export async function getServerSideProps(context) {
	const session = await getSession({ req: context.req });
	const userDetails = await findUserDetails(await session.user.userNumber);
	const user = userDetails.user;

	function error() {
		return { notFound: true };
	}

	return {
		props: {
			user: {
				id: user.userNumber ?? error,
				officialName: user.officialName ?? error,
				officialSurname: user.officialSurname ?? error,
				displayName: user.displayName ?? "",
				pronoun1: user.pronoun1 ?? "",
				dateOfBirth: new Date(user.dateOfBirth).toLocaleDateString(`fr-CA`).toString() ?? error,
				pronoun2: user.pronoun2 ?? "",
				email: user.email ?? error,
				school: user.school ?? "",
				phoneNumber: user.phoneNumber ?? "",
				nationality: user.nationality ?? "",
				allowPublicMessaging: user.allowMessagesFromEveryone,
				profileVisibility: user.profileVisibility,
				highestCurrentRoleName: userDetails.highestCurrentRoleName,
				currentRoles: userDetails.allCurrentRoles ?? [],
				pastRoles: userDetails.allPastRoles ?? [],
			},
			countries: countryCodesAndNames,
			schools: [{ schoolName: "The English School", schoolCode: "english_school" }],
		},
	};
}
