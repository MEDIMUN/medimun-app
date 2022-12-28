import Layout from "../../../app-components/layout";
import { Avatar, Input, Text, Switch, Stack, Radio, RadioGroup, Select } from "@chakra-ui/react";
import style from "../../../styles/account.module.css";
import prisma from "../../../prisma/client";
import { getSession } from "next-auth/react";
import { Divider, Image, Spacer } from "@nextui-org/react";
import {
	BeatLoader,
	Button,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
} from "@chakra-ui/react";
import { useState, useRef, Fragment } from "react";
import { useDisclosure, useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import axios, { AxiosRequestConfig } from "axios";
import { currentUserRoles, pastUserRoles, findUserDetails } from "../../../lib/user-operations/user-roles";

function Title(props) {
	return (
		<Fragment>
			<Spacer y={props.space} />
			<Text marginLeft="15px" fontFamily="sans-serif" fontWeight="500">
				<strong>{props.title}</strong>
			</Text>
			<Text marginLeft="14px">{props.description}</Text>
		</Fragment>
	);
}

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function AccountPage(props) {
	/* 	console.log(props.canEditInfo);
	console.log(props.availableRoleAssignments);
	console.log(props.availableCommitteeAssignments);
	console.log(props.availableTeamAssignments);
	console.log(props.availableSessionAssignments); */
	console.log(props.availableSessionAssignments);

	const official_name_ref = useRef(props.official_name);
	const official_surname_ref = useRef(props.official_surname);
	const [display_names_toggle, set_display_names_toggle] = useState(props.useDisplayNames);
	const [pronouns_toggle, set_pronouns_toggle] = useState(props.usePronouns);
	const display_name_ref = useRef(props.display_name);
	const display_surname_ref = useRef(props.display_surname);
	const pronoun_1_ref = useRef();
	const pronoun_2_ref = useRef();
	const date_of_birth_ref = useRef();
	const [profile_picture, set_profile_picture] = useState(false);
	const [cover_image, set_cover_image] = useState(false);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const toast = useToast();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const selected_session_ref = useRef();
	const selected_committee_ref = useRef();
	const selected_role_ref = useRef();
	const [newAvailableTeamAssignments, setNewAvailableTeamAssignments] = useState([]);
	const [schoolTeamCommittee, setSchoolTeamCommittee] = useState();

	let official_name;
	let official_surname;
	let display_names_toggle_value;
	let display_name;
	let display_surname;
	let pronoun_1;
	let pronoun_2;
	let date_of_birth;

	async function removeRole(roleName, roleId) {
		setLoading(true);
		const response = await fetch("/api/roles/remove", {
			method: "DELETE",
			body: JSON.stringify({
				roleName: roleName,
				roleId: roleId,
				userId: props.userId,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});
		const res = await response.json();
		if (res.status === 200) {
			toast({
				id: "success",
				title: res.title,
				description: res.description,
				status: res.status,
				duration: res.duration,
				isClosable: res.isClosable,
				position: "top",
			});
			router.push(router.asPath);
			setLoading(false);
			return;
		}
		if (res.status !== 200) {
			toast({
				id: "error",
				title: res.title,
				description: res.description,
				status: res.status,
				duration: res.duration,
				isClosable: res.isClosable,
				position: "top",
			});
			router.push(router.asPath);
			setLoading(false);
			return;
		}
		router.push(router.asPath);
	}

	async function removeProfilePicture() {
		let res;
		set_profile_picture(true);
		try {
			const response = await fetch("/api/account/remove-profile-picture", {
				method: "DELETE",
			});
			res = await response.json();
		} catch (error) {
			toast({
				id: "error",
				title: "Error",
				description: "Something went wrong",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "top",
			});
			set_profile_picture(false);
			return;
		}
		toast({
			id: "success",
			title: res.title,
			description: res.description,
			status: res.status,
			duration: res.duration,
			isClosable: res.isClosable,
			position: "top",
		});
		router.replace(router.asPath);
		set_profile_picture(false);
	}

	async function removeCoverImage() {
		let res;
		set_cover_image(true);
		try {
			const response = await fetch("/api/account/remove-cover-image", {
				method: "DELETE",
			});
			res = await response.json();
		} catch (error) {
			toast({
				id: "error",
				title: "Error",
				description: "Something went wrong",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "top",
			});
			set_cover_image(false);
			return;
		}

		toast({
			id: "success",
			title: res.title,
			description: res.description,
			status: res.status,
			duration: res.duration,
			isClosable: res.isClosable,
			position: "top",
		});
		router.replace(router.asPath);
		set_cover_image(false);
	}

	async function submitHandler() {
		setLoading(true);
		official_name = official_name_ref.current.value;
		official_surname = official_surname_ref.current.value;
		display_names_toggle_value = display_names_toggle || "false";

		if (display_names_toggle_value == true) {
			display_name = display_name_ref.current.value;
			display_surname = display_surname_ref.current.value;
		} else {
			display_name = "";
			display_surname = "";
		}

		if (pronouns_toggle == true) {
			pronoun_1 = pronoun_1_ref.current.value;
			pronoun_2 = pronoun_2_ref.current.value;
		} else {
			pronoun_1 = "";
			pronoun_2 = "";
		}
		date_of_birth = date_of_birth_ref.current.value;

		const res = await fetch("/api/account/update", {
			method: "PATCH",
			body: JSON.stringify({
				official_name,
				official_surname,
				display_names_toggle,
				display_name,
				display_surname,
				pronouns_toggle,
				pronoun_1,
				pronoun_2,
				date_of_birth,
				show_phone_number,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});

		let response = await res.json();

		if (!toast.isActive("alert")) {
			toast({
				id: "alert",
				title: response.title,
				description: response.description,
				status: response.status,
				duration: response.duration,
				isClosable: response.isClosable,
				position: "top",
			});
		}

		if (res.status === 400) {
			setLoading(false);
			onClose();
		}

		if (res.status === 200) {
			setLoading(false);
			onClose();

			router.replace(router.asPath);
		}
	}

	let TeamOrCommittee;
	const [NewRoleButtons, setNewRoleButtons] = useState(false);
	function newRoleSelected() {
		setNewRoleButtons(false);
		const role = selected_role_ref.current.value;
		setSchoolTeamCommittee("Team");

		if (role === "Manager") {
			setNewAvailableTeamAssignments(
				props.availableTeamAssignments.filter(
					(committee) => committee.session_id === selected_session_ref.current.value
				)
			);
			return;
		}

		if (role === "Member") {
			setNewRoleButtons(false);

			setSchoolTeamCommittee("Team");
			setNewAvailableTeamAssignments(
				props.availableTeamAssignments.filter(
					(committee) => committee.session_id === selected_session_ref.current.value
				)
			);
			return;
		}

		if (role === "Delegate") {
			setNewRoleButtons(false);

			setSchoolTeamCommittee("Committee");
			setNewAvailableTeamAssignments(
				props.availableCommitteeAssignments.filter(
					(committee) => committee.session_id === selected_session_ref.current.value
				)
			);
			return;
		}

		if (role === "Chair") {
			setNewRoleButtons(false);

			setSchoolTeamCommittee("Committee");
			setNewAvailableTeamAssignments(
				props.availableCommitteeAssignments.filter(
					(committee) => committee.session_id === selected_session_ref.current.value
				)
			);
			return;
		}

		if (role === "School Director") {
			setNewRoleButtons(false);

			setSchoolTeamCommittee("School");
			setNewAvailableTeamAssignments(props.allSchools);
			return;
		}

		setNewAvailableTeamAssignments([]);
		if (selected_role_ref.current.value) {
			setNewRoleButtons(true);
		} else {
			setNewRoleButtons(false);
		}
	}

	function newFinalChoice1Selected() {
		if (selected_role_ref.current.value && selected_session_ref.current.value && selected_committee_ref.current.value) {
			setNewRoleButtons(true);
		} else {
			setNewRoleButtons(false);
		}
	}

	async function AddUserRole() {
		setLoading(true);
		const role = selected_role_ref.current.value;
		const session = selected_session_ref.current.value;
		let committee;
		if (selected_committee_ref.current) {
			committee = selected_committee_ref.current.value;
		} else {
			committee = "";
		}

		const res = await fetch(`/api/roles/add/`, {
			method: "PUT",
			body: JSON.stringify({
				role: role,
				sessionId: selected_session_ref.current.value,
				committee,
				userNumber: props.userNumber,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});
		let response = await res.json();

		if (!toast.isActive("alert")) {
			toast({
				id: "alert",
				title: response.title,
				description: response.description,
				status: response.status,
				duration: response.duration,
				isClosable: response.isClosable,
				position: "top",
			});
		}

		if (res.status === 200 && response.status === "success") {
			setLoading(false);
			router.replace(router.asPath);
		}

		if (res) {
			setLoading(false);
		}
	}

	return (
		<Layout>
			<div className={style.page}>
				<div
					style={{
						backgroundColor: "#EDF2F7",
						backgroundImage: `url(${props.coverImageLink || "/placeholders/cover-image.jpg"})`,
					}}
					className={style.nameholder}>
					<div className={style.picture}>
						<Avatar className={style.pfp} borderRadius="50%" src={`${props.profilePictureLink}`} />
					</div>
				</div>
				<Spacer y={5} />
				<Text marginLeft="28px" fontFamily="sans-serif" fontWeight="500">
					<strong> USER INFORMATION </strong>
				</Text>

				<ul className={style.infoList}>
					<li>
						<div>
							<Text>USERID</Text>
							<Text>{props.userNumber}</Text>
						</div>
					</li>
					<li>
						<div>
							<Text>USERNAME</Text>
							<Text>
								<span className={style.unselectable}>@</span>
								<strong>{props.userName}</strong>
							</Text>
						</div>
					</li>
					<Spacer y={0.5} />
					<li>
						<div>
							<Text>SCHOOL</Text>
							<Text>{props.school}</Text>
						</div>
					</li>
					<Spacer y={0.5} />
					<li>
						<div>
							<Text>OFFICIAL NAME</Text>
							<Text>{props.official_name}</Text>
						</div>
					</li>
					<li>
						<div>
							<Text>OFFICIAL SURNAME</Text>
							<Text>{props.official_surname}</Text>
						</div>
					</li>
					<Spacer y={0.5} />
					{props.display_name && (
						<Fragment>
							<li>
								<div>
									<Text>DISPLAY NAME</Text>
									<Text>{props.display_name}</Text>
								</div>
							</li>
							<Spacer y={0.5} />
						</Fragment>
					)}
					{props.display_surname && (
						<Fragment>
							<li>
								<div>
									<Text>DISPLAY SURNAME</Text>
									<Text>{props.display_surname}</Text>
								</div>
							</li>
							<Spacer y={0.5} />
						</Fragment>
					)}
					<li>
						<div>
							<Text>BIRTH DATE</Text>
							<Text>{props.birthDate}</Text>
						</div>
					</li>
					<li>
						<div>
							<Text>NATIONALITY</Text>
							<Text>{props.nationality}</Text>
						</div>
					</li>
					<Spacer y={0.5} />
					<li>
						<div>
							<Text>EMAIL</Text>
							<Text>{props.email}</Text>
						</div>
					</li>
					{!props.phone_number && <Spacer y={0.5} />}
					{props.phone_number && (
						<Fragment>
							<li>
								<div>
									<Text>PHONE NUMBER</Text>
									<Text>{props.phone_number}</Text>
								</div>
							</li>
							<Spacer y={0.5} />
						</Fragment>
					)}
				</ul>
				<Divider />
				<div className={style.section}>
					<Title title="ROLE ASSIGNMENT" description="Assign a role to the user." space="0" />
					<div className={style.fdr}>
						<Select ref={selected_session_ref} onChange={newRoleSelected} mr={3} variant="filled" placeholder="Session">
							{props.availableSessionAssignments.map((session) => (
								<option key={session.id} value={session.id}>
									{session.number}
								</option>
							))}
						</Select>

						<Select ref={selected_role_ref} onChange={newRoleSelected} variant="filled" placeholder="Role">
							{props.availableRoleAssignments.map((role) => (
								<option key={role} value={role}>
									{role}
								</option>
							))}
						</Select>
					</div>
					{newAvailableTeamAssignments.length > 0 ? (
						<Fragment>
							<Spacer y={1} />
							<Select
								onChange={newFinalChoice1Selected}
								ref={selected_committee_ref}
								variant="filled"
								placeholder={schoolTeamCommittee}>
								{newAvailableTeamAssignments.map((committee) => (
									<option key={committee.id} value={committee.id}>
										{committee.name}
									</option>
								))}
							</Select>
						</Fragment>
					) : null}
					{NewRoleButtons && (
						<Fragment>
							<Spacer y={1} />
							<div className={style.fdr}>
								<Button isLoading={loading} onClick={AddUserRole} mr={3}>
									Add Role
								</Button>
							</div>
						</Fragment>
					)}
					<Title title="CURRENT ROLES" description="Remove roles from the user." space="1" />
					{props.allRoles.map((role) => (
						<div className={style.removeRoles} key={role.id}>
							<Text marginLeft="14px">{role.name}</Text>
							<div className={style.removeDivider}>
								{role.session !== "All" ? (
									<Button
										onClick={() => {
											goToSessionPage(role.session);
										}}
										marginLeft="auto"
										color="white"
										padding="2px 10px"
										backgroundColor="var(--mediblue)"
										borderRadius="20px"
										mr={2}
										size="small">
										MEDIMUN {role.session}
									</Button>
								) : null}
								{role.roleId !== null ? (
									<Button
										onClick={() => {
											removeRole(role.name, role.roleId);
										}}
										isLoading={loading}
										color="white"
										padding="2px 10px"
										backgroundColor="red"
										borderRadius="20px"
										size="small">
										REMOVE
									</Button>
								) : null}
							</div>
						</div>
					))}
					<Spacer y={1.4} />
					<Divider></Divider>
					<Title
						title="PROFILE PICTURE AND COVER IMAGE"
						description="You can remove a profile picture or a cover image if it's offensive."
						space="1.2"
					/>
					<div className={style.removeButtons}>
						<Button mr={3} isLoading={profile_picture} onClick={removeProfilePicture}>
							Remove profile picture
						</Button>
						<Button isLoading={cover_image} onClick={removeCoverImage}>
							Remove cover image
						</Button>
					</div>
					<Spacer y={1.4} />
					<Divider></Divider>
					<Title
						title="OFFICIAL NAME"
						description="The official name will be used on the certificate and must match passport name."
					/>
					<Input
						maxLength="20"
						ref={official_name_ref}
						variant="filled"
						width="calc(100%)"
						placeholder={props.official_name}
					/>
					<Title
						title="OFFICIAL SURNAME"
						description="The official surname will be used on the certificate and must match passport surname."
						space="1"
					/>
					<Input
						maxLength="20"
						ref={official_surname_ref}
						variant="filled"
						width="calc(100%)"
						placeholder={props.official_surname}
					/>
					<Spacer y={1} />
					<div>
						<Text marginLeft="15px" fontFamily="sans-serif" fontWeight="500">
							<strong>USE DISPLAY NAME SET</strong>
						</Text>
						<div className="fdr">
							<Spacer x={1} />
							<Switch
								defaultChecked={props.useDisplayNames}
								onChange={() => set_display_names_toggle(!display_names_toggle)}
								size="lg"
							/>
							<Text marginLeft="14px">If turned off, yor official name and surname will be used instead.</Text>
						</div>
					</div>
					{display_names_toggle && (
						<div>
							<Title title="DISPLAY NAME" description="The display name is used on the profile and on the nametag" />
							<Input
								maxLength="20"
								ref={display_name_ref}
								variant="filled"
								width="calc(100%)"
								placeholder={props.display_name}
							/>
							<Title
								title="DISPLAY SURNAME"
								description="The display surname is used on the profile and on the nametag"
								space="1"
							/>
							<Input
								maxLength="20"
								ref={display_surname_ref}
								variant="filled"
								width="calc(100%)"
								placeholder={props.display_surname}
							/>
						</div>
					)}
					<div>
						<Title title="PRONOUNS" />
						<div className="fdr">
							<Spacer x={1} />
							<Switch
								defaultChecked={props.usePronouns}
								onChange={() => set_pronouns_toggle(!pronouns_toggle)}
								size="lg"
							/>
							<Text marginLeft="14px">If turned off, the pronouns will not be displayed.</Text>
						</div>
					</div>
					{pronouns_toggle && (
						<Fragment>
							<Spacer y={1} />
							<Text marginLeft="15px" fontFamily="sans-serif" fontWeight="500">
								<strong> PRONOUNS </strong>
							</Text>

							<div>
								<Input
									maxLength="5"
									ref={pronoun_1_ref}
									borderRadius="5px 0 0 5px"
									variant="filled"
									width="calc(50%)"
									borderRight="2px solid #e2e8f0"
									placeholder={props.pronoun1 || "First Pronoun"}
								/>
								<Input
									maxLength="5"
									ref={pronoun_2_ref}
									borderRadius="0 5px 5px 0"
									variant="filled"
									width="calc(50%)"
									placeholder={props.pronoun2 || "Second Pronoun"}
								/>
							</div>
						</Fragment>
					)}
					<Title title="DATE OF BIRTH" />
					<Input
						ref={date_of_birth_ref}
						variant="filled"
						width="calc(100%)"
						placeholder="Select Date and Time"
						size="md"
						type="date"
					/>
					<Spacer x={1} />
				</div>
				<Button isLoading={loading} ml={3} mr={3} onClick={onOpen}>
					Save
				</Button>
				<Button isLoading={loading} onClick={() => router.push("/users")}>
					Cancel
				</Button>
			</div>
		</Layout>
	);
}

export async function getServerSideProps(context) {
	let linkUserNumber,
		linkUser,
		queryUserNumber,
		canSeePhoneNumber = false,
		useDisplayNames = false,
		usePronouns = false,
		linkUserId = context.query.user;

	const session = await getSession({ req: context.req });

	if (!session) {
		return {
			redirect: {
				destination: "/login",
			},
		};
	}

	if (linkUserId.charAt(0) === "@") {
		linkUser = await prisma.user.findFirst({
			where: {
				username: linkUserId.slice(1),
			},
			include: {
				schoolDirector: { include: { school: true } },
				schoolStudent: { include: { school: true } },
				delegate: true,
				member: true,
			},
		});
	} else {
		linkUser = await prisma.user.findFirst({
			where: {
				userNumber: linkUserId,
			},
			include: {
				schoolDirector: { include: { school: true } },
				schoolStudent: { include: { school: true } },
				delegate: true,
				member: true,
			},
		});
	}

	const currentCommittees = await prisma.committee.findMany({
		where: { session: { isCurrent: true } },
	});

	const currentTeams = await prisma.team.findMany({
		where: { session: { isCurrent: true } },
	});

	const currentSession = await prisma.session.findFirst({
		where: { isCurrent: true },
	});

	const allSessions = await prisma.session.findMany({});
	const allCommittees = await prisma.committee.findMany({});
	const allTeams = await prisma.team.findMany({});

	const queryUser = await prisma.user.findFirst({
		where: {
			userNumber: session.user.userNumber,
		},
		include: {
			schoolDirector: { include: { school: true } },
			member: { include: { session: true } },
			chair: true,
			manager: true,
		},
	});

	if (!linkUser) {
		return {
			notFound: true,
		};
	}

	linkUserNumber = linkUser.userNumber;
	queryUserNumber = queryUser.userNumber;

	/* 	if ((linkUserNumber = queryUserNumber)) {
		return {
			redirect: {
				destination: "/account",
				permanent: false,
			},
		};
	} */

	const roleNumbers = {
		"Global Admin": 0,
		"Senior Director": 1,
		"Secretary-General": 3,
		"President of the General Assembly": 3,
		"Deputy Secretary-General": 4,
		Manager: 6,
		Chair: 6,
		Member: 7,
		"School Director": 8,
		Delegate: 9,
	};

	const currentLinkUserRoles = await currentUserRoles(linkUserNumber);
	const currentQueryUserRoles = await currentUserRoles(queryUserNumber);
	const pastLinkUserRoles = await pastUserRoles(linkUserNumber);

	const queryUserHighestRole = currentQueryUserRoles[0];
	const linkUserHighestRole = currentLinkUserRoles[0];

	const currentLinkUserRoleNumber = roleNumbers[linkUserHighestRole];
	const currentQueryUSerRoleNumber = roleNumbers[queryUserHighestRole];

	/* 	if (currentLinkUserRoleNumber < currentQueryUSerRoleNumber) {
		return {
			notFound: true,
		};
	} */

	if (currentQueryUserRoles.length == 0) {
		return {
			notFound: true,
		};
	}
	////////////////////////////////////////////////////////////////////////

	let availableRoleAssignments = [];
	let availableSessionAssignments = [];
	let availableCommitteeAssignments = [];
	let availableTeamAssignments = [];
	let canAssignSchool;
	let canEditInfo;

	// GLOBAL ADMIN ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	if (queryUserHighestRole == "Global Admin") {
		availableRoleAssignments = [
			"Global Admin",
			"Senior Director",
			"Secretary-General",
			"President of the General Assembly",
			"Deputy Secretary-General",
			"Manager",
			"Chair",
			"Member",
			"School Director",
			"Delegate",
		];
		//
		canSeePhoneNumber = true;
		availableCommitteeAssignments = allCommittees;
		availableTeamAssignments = allTeams;
		//
		canAssignSchool = true;
		canEditInfo = true;
		availableSessionAssignments = allSessions;
	}

	// SENIOR DIRECTOR ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	if (queryUserHighestRole == "Senior Director") {
		availableRoleAssignments = [
			"Senior Director",
			"Secretary-General",
			"President of the General Assembly",
			"Deputy Secretary-General",
			"Manager",
			"Chair",
			"Member",
			"School Director",
			"Delegate",
		];
		canSeePhoneNumber = true;
		availableCommitteeAssignments = allCommittees;
		availableTeamAssignments = allTeams;
		availableSessionAssignments = allSessions;
		canAssignSchool = true;
		canEditInfo = true;
	}

	// SCHOOL DIRECTOR ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	if (queryUserHighestRole == "School Director") {
		availableRoleAssignments = [];
		availableSessionAssignments = [];
		availableCommitteeAssignments = [];
		availableTeamAssignments = [];
		canAssignSchool = false;
		if (queryUser.schoolDirector[0].school.id == linkUser.SchoolMember[0].school.id) {
			canEditInfo = true;
		} else {
			return {
				notFound: true,
			};
		}
	}

	// SECRETARY-GENERAL ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	if (queryUserHighestRole == "Secretary-General") {
		availableRoleAssignments = ["Manager", "Chair", "Member", "School Director", "Delegate"];
		canSeePhoneNumber = true;
		availableSessionAssignments = allSessions;
		availableCommitteeAssignments = allCommittees;
		availableTeamAssignments = allTeams;
		canAssignSchool = true;
		canEditInfo = true;
	}

	// PRESIDENT OF THE GA ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	if (queryUserHighestRole == "President of the General Assembly") {
		availableRoleAssignments = ["Manager", "Chair", "Member", "School Director", "Delegate"];
		canSeePhoneNumber = true;
		availableSessionAssignments = allSessions;
		availableCommitteeAssignments = allCommittees;
		availableTeamAssignments = allTeams;
		canAssignSchool = true;
		canEditInfo = true;
	}

	// DEPUTY SECRETARY GENERAL ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	if (queryUserHighestRole == "Deputy Secretary-General") {
		availableRoleAssignments = ["Manager", "Chair", "Member", "School Director", "Delegate"];
		canSeePhoneNumber = true;
		availableSessionAssignments = currentSession;
		availableCommitteeAssignments = currentCommittees;
		availableTeamAssignments = currentTeams;
		canAssignSchool = true;
		canEditInfo = true;
	}

	// MANAGER ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	if (queryUserHighestRole == "Manager") {
		availableRoleAssignments = ["Member"];
		availableSessionAssignments = currentSession;
		availableCommitteeAssignments = [];
		availableTeamAssignments = [];
		canAssignSchool = false;
	}

	// CHAIR ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	if (queryUserHighestRole == "Chair") {
		availableRoleAssignments = [];
		availableSessionAssignments = [];
		availableTeamAssignments = [];
		canAssignSchool = true;
	}

	// DELEGATE ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	if (queryUserHighestRole == "Delegate") {
		return {
			notFound: true,
		};
	}

	// MEMBER ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	if (queryUserHighestRole == "Member") {
		return {
			notFound: true,
		};
	}

	var Minio = require("minio");

	var minioClient = new Minio.Client({
		endPoint: "storage-s3.manage.beoz.org",
		useSSL: false,
		accessKey: "admin",
		secretKey: "BPbpMinio2006!",
	});

	if (linkUser.display_name || linkUser.display_surname) {
		useDisplayNames = true;
	}

	if (linkUser.pronoun1 || linkUser.pronoun2) {
		usePronouns = true;
	}

	let allSchools = [];
	let phoneNumber = "";

	if (canAssignSchool == true) {
		allSchools = await prisma.school.findMany();
	}

	if (canSeePhoneNumber == true) {
		phoneNumber = linkUser.phoneNumber;
	}

	let school;
	if (linkUser.schoolStudent.length > 0) {
		school = linkUser.SchoolMember[0].school.name;
	} else {
		school = "No School Assigned";
	}

	const allRoles = await findUserDetails(linkUserId);

	let profilePictureLink;
	let coverImageLink;
	try {
		profilePictureLink = await minioClient.presignedGetObject(
			"profile-pictures",
			`${linkUser.userNumber}`,
			6 * 60 * 60
		);
	} catch (error) {
		profilePictureLink = "/public/profile-picture-placeholder";
	}

	try {
		coverImageLink = await minioClient.presignedGetObject("cover-images", `${linkUser.userNumber}`, 6 * 60 * 60);
	} catch (error) {
		coverImageLink = "/public/cover-image-placeholder";
	}

	console.log(availableSessionAssignments);

	console.log(await profilePictureLink);
	console.log(await coverImageLink);

	console.log(availableSessionAssignments);

	return {
		props: {
			userName: linkUser.username,
			official_name: linkUser.officialName,
			official_surname: linkUser.officialSurname,
			display_name: linkUser.displayName,
			display_surname: linkUser.displaySurname,
			pronoun1: linkUser.pronoun1,
			pronoun2: linkUser.pronoun2,
			phone_number: linkUser.phoneNumber,
			email: linkUser.email,
			useDisplayNames: useDisplayNames,
			school: school,
			usePronouns: usePronouns,
			phoneNumber: phoneNumber,
			birthDate: linkUser.dateOfBirth.toLocaleDateString(),
			profilePictureLink: await profilePictureLink,
			coverImageLink: await coverImageLink,
			sessions: allSessions,
			currentTeams: currentTeams,
			currentCommittees: currentCommittees,
			currentRoles: currentLinkUserRoles,
			pastRoles: pastLinkUserRoles,
			userId: linkUserId,
			//
			canSeePhoneNumber: canSeePhoneNumber,
			nationality: "CY",
			canEditInfo: canEditInfo,
			canAssignSchool: canAssignSchool,
			availableRoleAssignments: availableRoleAssignments,
			availableSessionAssignments: availableSessionAssignments,
			availableCommitteeAssignments: availableCommitteeAssignments,
			availableTeamAssignments: availableTeamAssignments,
			allSchools: allSchools,
			userNumber: linkUser.userNumber,
			allRoles: allRoles.allRoles,
		},
	};
}
