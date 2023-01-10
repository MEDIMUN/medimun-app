import Layout from "../../app-components/layout";
import { Avatar, Input, Text, Switch, Stack, Radio, RadioGroup } from "@chakra-ui/react";
import style from "../../styles/account.module.css";
import prisma from "../../prisma/client";
import { getSession } from "next-auth/react";
import { Image, Spacer } from "@nextui-org/react";
import {
	BeatLoader,
	Button,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	Lorem,
	ModalFooter,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { useDisclosure, useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import axios, { AxiosRequestConfig } from "axios";

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function AccountPage(props) {
	const official_name_ref = useRef(props.official_name);
	const official_surname_ref = useRef(props.official_surname);
	const [display_names_toggle, set_display_names_toggle] = useState(props.useDisplayNames);
	const [pronouns_toggle, set_pronouns_toggle] = useState(props.usePronouns);
	const display_name_ref = useRef(props.display_name);
	const display_surname_ref = useRef(props.display_surname);
	const pronoun_1_ref = useRef();
	const pronoun_2_ref = useRef();
	const date_of_birth_ref = useRef();
	const profile_picture_ref = useRef();
	const cover_image_ref = useRef();
	const [profile_visibility, set_profile_visibility] = useState();
	const [organiser_profile_visibility, set_organiser_profile_visibility] = useState();
	const [show_phone_number, set_show_phone_number] = useState(false);
	const [allow_public_messaging, set_allow_public_messaging] = useState(false);
	const [profile_picture, set_profile_picture] = useState(false);
	const [cover_image, set_cover_image] = useState(false);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const toast = useToast();
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	let official_name;
	let official_surname;
	let display_names_toggle_value;
	let display_name;
	let display_surname;
	let pronoun_1;
	let pronoun_2;
	let date_of_birth;
	let profile_visibility_value;
	let organiser_profile_visibility_value;
	let show_phone_number_value;
	let allow_public_messaging_value;

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

	async function uploadProfilePicture() {
		set_profile_picture(true);
		if (!profile_picture_ref.current.files[0]) {
			set_profile_picture(false);
			return;
		}
		let formData = new FormData();
		formData.append("file", profile_picture_ref.current.files[0]);
		try {
			const response = await axios.post("/api/account/profile-picture", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			if (!toast.isActive("error")) {
				toast({
					id: "error",
					title: response.data.title,
					description: response.data.description,
					status: response.data.status,
					duration: response.data.duration,
					isClosable: response.data.isClosable,
					position: "top",
				});
			}
		} catch (error) {
			if (error.response) {
				if (!toast.isActive("error")) {
					toast({
						id: "error",
						title: error.response.data.title,
						description: error.response.data.description,
						status: error.response.data.status,
						duration: error.response.data.duration,
						isClosable: error.response.data.isClosable,
						position: "top",
					});
				}
				// get response with a status code not in range 2xx
			} else if (error.request) {
				// no response
			} else {
				// Something wrong in setting up the request
			}
		}

		set_profile_picture(false);
		router.replace(router.asPath);
	}

	async function uploadCoverImage() {
		set_cover_image(true);

		if (!cover_image_ref.current.files[0]) {
			set_cover_image(false);
			return;
		}

		let formData = new FormData();
		formData.append("file", cover_image_ref.current.files[0]);
		try {
			const response = await axios.post("/api/account/cover-image", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			if (!toast.isActive("error")) {
				toast({
					id: "error",
					title: response.data.title,
					description: response.data.description,
					status: response.data.status,
					duration: response.data.duration,
					isClosable: response.data.isClosable,
					position: "top",
				});
			}
		} catch (error) {
			if (error.response) {
				if (!toast.isActive("error")) {
					toast({
						id: "error",
						title: error.response.data.title,
						description: error.response.data.description,
						status: error.response.data.status,
						duration: error.response.data.duration,
						isClosable: error.response.data.isClosable,
						position: "top",
					});
				}
			} else if (error.request) {
			} else {
				console.log("Error", error.message);
			}
			console.log(error.config);
		}
		set_cover_image(false);
		router.replace(router.asPath);
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
		profile_visibility_value = profile_visibility;
		organiser_profile_visibility_value = organiser_profile_visibility;
		show_phone_number_value = show_phone_number || "false";
		allow_public_messaging_value = allow_public_messaging || "false";

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
				profile_visibility,
				organiser_profile_visibility,
				show_phone_number,
				allow_public_messaging,
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

	return (
		<Layout>
			<Modal isCentered closeOnOverlayClick={true} isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Are you sure you want to change the following?</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						<Text>
							<strong>
								The fields you<span>&apos;</span>ve left empty won<span>&apos;</span>t be changed.
							</strong>
						</Text>
						<Text>
							The official name will be printed on your certificate, and the display name will be used on your nametag.
							We take no responsibility for any spelling mistakes, please double check your spelling. You can update
							your info at any time and retrieve your new certificate any time after approval.
						</Text>
						<Spacer y={1} />
						{official_name_ref.current.value ? (
							<Text>
								Official Name from {props.official_name} to <strong>{official_name_ref.current.value}</strong>
							</Text>
						) : null}
						{official_surname_ref.current.value != "" && (
							<Text>
								Official Surname from {props.official_surname} to <strong>{official_surname_ref.current.value}</strong>
							</Text>
						)}
						{display_names_toggle && display_name_ref.current != null ? (
							<Text>
								Display Name from {props.display_name} to <strong>{display_name_ref.current.value || ""}</strong>
							</Text>
						) : null}
						{display_names_toggle && display_surname_ref.current != null ? (
							<Text>
								Display Surname from {props.display_surname} to <strong>{display_surname_ref.current.value}</strong>
							</Text>
						) : null}
					</ModalBody>
					<Text></Text>
					<ModalFooter>
						{loading ? (
							<Button mr={3} isLoading>
								Save
							</Button>
						) : (
							<Button onClick={submitHandler} mr={3}>
								Save
							</Button>
						)}

						<Button onClick={onClose}>Cancel</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
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
				<Spacer y={4} />
				<div className={style.section}>
					<Text marginLeft="15px" fontFamily="sans-serif" fontWeight="500">
						<strong> PROFILE PICTURE</strong>
					</Text>
					<Text marginLeft="14px">Clicking Upload automatically saves the profile picture.</Text>

					<div className={style.uploadButtons}>
						<Input
							ref={profile_picture_ref}
							placeholder="Upload"
							className={style.uploadButton}
							backgroundColor="#EDF2F7"
							type="file"
						/>
						<Button isLoading={profile_picture} onClick={uploadProfilePicture}>
							Upload
						</Button>
						<Button isLoading={profile_picture} onClick={removeProfilePicture}>
							Remove
						</Button>
					</div>

					<Spacer x={1} />

					<Text marginLeft="15px" fontFamily="sans-serif" fontWeight="500">
						<strong> COVER IMAGE </strong>
					</Text>
					<Text marginLeft="14px">Clicking Upload automatically saves the cover image.</Text>

					<div className={style.uploadButtons}>
						<Input ref={cover_image_ref} className={style.uploadButton} backgroundColor="#EDF2F7" type="file" />
						<Button isLoading={cover_image} onClick={uploadCoverImage}>
							Upload
						</Button>
						<Button isLoading={cover_image} onClick={removeCoverImage}>
							Remove
						</Button>
					</div>

					<Spacer y={1} />

					<Text marginLeft="15px" fontFamily="sans-serif" fontWeight="500">
						<strong> OFFICIAL NAME </strong>
					</Text>

					<Text borderBottom="2.5px solid #FFF" paddingLeft="14px">
						Your official name will be used on your certificate and must match the name on your passport.
					</Text>

					<Input
						maxLength="20"
						ref={official_name_ref}
						variant="filled"
						width="calc(100%)"
						placeholder={props.official_name}
					/>

					<Spacer x={1} />

					<Text maxLength="20" marginLeft="15px" marginRight="15px" fontFamily="sans-serif" fontWeight="500">
						<strong> OFFICIAL SURNAME </strong>
					</Text>

					<Text borderBottom="2.5px solid #FFF" paddingLeft="14px">
						Your official surname will be used on your certificate and must match the name on your passport.
					</Text>

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
						<Spacer y={1} />
					</div>
					{display_names_toggle && (
						<div>
							<Text marginLeft="15px" fontFamily="sans-serif" fontWeight="500">
								<strong> DISPLAY NAME </strong>
							</Text>

							<Text borderBottom="2.5px solid #FFF" paddingLeft="14px">
								If added your display name will be used on your profile and nametag.
							</Text>

							<Input
								maxLength="20"
								ref={display_name_ref}
								variant="filled"
								width="calc(100%)"
								placeholder={props.display_name}
							/>

							<Spacer y={1} />
							<Text marginLeft="15px" fontFamily="sans-serif" fontWeight="500">
								<strong> DISPLAY SURNAME </strong>
							</Text>
							<Text borderBottom="2.5px solid #FFF" paddingLeft="14px">
								If added your display surname will be used on your profile and nametag.
							</Text>

							<Input
								maxLength="20"
								ref={display_surname_ref}
								variant="filled"
								width="calc(100%)"
								placeholder={props.display_surname}
							/>
							<Spacer y={1} />
						</div>
					)}

					<div>
						<Text marginLeft="15px" fontFamily="sans-serif" fontWeight="500">
							<strong>USE PRONOUNS</strong>
						</Text>
						<div className="fdr">
							<Spacer x={1} />
							<Switch
								defaultChecked={props.usePronouns}
								onChange={() => set_pronouns_toggle(!pronouns_toggle)}
								size="lg"
							/>
							<Text marginLeft="14px">If turned off, your profile and nametag will not contain pronouns.</Text>
						</div>
						<Spacer y={1} />
					</div>

					{pronouns_toggle && (
						<div>
							<Text marginLeft="15px" fontFamily="sans-serif" fontWeight="500">
								<strong> PRONOUNS </strong>
							</Text>

							<Text borderBottom="2.5px solid #FFF" paddingLeft="14px">
								Your pronouns will be used on your profile and nametag in the future as this feature is experimental and
								will be used in the 19<sup>th</sup> Session of MEDIMUN.
							</Text>

							<div>
								<Input
									maxLength="5"
									ref={pronoun_1_ref}
									borderRadius="5px 0 0 5px"
									variant="filled"
									width="calc(50%)"
									borderRight="2px solid #e2e8f0"
									placeholder={props.pronoun1}
								/>
								<Input
									maxLength="5"
									ref={pronoun_2_ref}
									borderRadius="0 5px 5px 0"
									variant="filled"
									width="calc(50%)"
									placeholder={props.pronoun2}
								/>
							</div>
							<Spacer x={1} />
						</div>
					)}

					<Text marginLeft="15px" fontFamily="sans-serif" fontWeight="500">
						<strong> DATE OF BIRTH </strong>
					</Text>
					<Text borderBottom="2.5px solid #FFF" paddingLeft="14px">
						Your date of birth is only visible to members of MEDIMUN management and will not be shown anywhere else.{" "}
					</Text>
					<Input
						ref={date_of_birth_ref}
						variant="filled"
						width="calc(100%)"
						placeholder="Select Date and Time"
						size="md"
						type="date"
					/>
					<Spacer y={1} />
					<Text marginLeft="15px" fontFamily="sans-serif" fontWeight="500">
						<strong> PROFILE VISIBILITY</strong>
					</Text>
					<Text marginLeft="14px" borderBottom="2.5px solid #FFF">
						Your choice may eb disregarded if you are enrolled in the current session of MEDIMUN.{" "}
					</Text>

					<RadioGroup
						onChange={set_profile_visibility}
						backgroundColor="#EDF2F7"
						borderRadius="5px"
						padding="10px"
						marginLeft="4px"
						defaultValue={`${props.profile_visibility}`}>
						<Stack>
							<Radio value="1">Public Profile</Radio>
							<Text borderBottom="2.5px solid #FFF" paddingLeft="24px">
								If turned on, everyone including people without a MEDIMUN account will be able to see your profile.
							</Text>
							<Radio value="2">Internal Only Profile</Radio>
							<Text borderBottom="2.5px solid #FFF" paddingLeft="24px">
								If turned on, only people with a MEDIMUN account will be able to see your profile.
							</Text>
							<Radio value="3">Session Only Profile</Radio>
							<Text borderBottom="2.5px solid #FFF" paddingLeft="24px">
								If turned on, only people enrolled in the current session of MEDIMUN will be able to see your profile
								even after the session ends, if you don
								<span>&apos;</span>t wan<span>&apos;</span>t your profile to be visible after the session ends, please
								set it to private after the sessions ends.
							</Text>
							<Radio value="4">Committee Only Profile</Radio>
							<Text borderBottom="2.5px solid #FFF" paddingLeft="24px">
								If turned on, only people in your committee will be able to see your profile.
							</Text>
							<Radio value="5">Verified User Only Profile</Radio>
							<Text borderBottom="2.5px solid #FFF" paddingLeft="24px">
								If turned on, only people currently enrolled or people who had been enrolled in the past will be able to
								see your profile. People who have a MEDIMUN account and have not been enrolled in any session will not
								be able to see your profile.
							</Text>
							<Radio value="6">Private Profile</Radio>
							<Text paddingLeft="24px">
								If turned on, no one will be able to see your profile. This option is not recommended for currently
								enrolled participants.
							</Text>
						</Stack>
					</RadioGroup>
					<Spacer y={1} />
					<Text marginLeft="15px" fontFamily="sans-serif" fontWeight="500">
						<strong> PROFILE VISIBILITY OPTIONS FOR ORGANISERS </strong>
					</Text>
					<Text borderBottom="2.5px solid #FFF" paddingLeft="14px">
						This option determines if an organiser can see your profile. Organisers who are required to see your profile
						will be able to view your profile no matter the profile visibility options you have set.
					</Text>
					<RadioGroup
						onChange={set_organiser_profile_visibility}
						backgroundColor="#EDF2F7"
						borderRadius="5px"
						padding="10px"
						marginLeft="4px"
						defaultValue={`${props.organiser_profile_visibility}`}>
						<Stack>
							<Radio value="1">All Organisers</Radio>
							<Text borderBottom="2.5px solid #FFF" paddingLeft="24px">
								If turned on, all organisers in all sessions will be able to see your profile.
							</Text>
							<Radio value="2">Organisers in Current Session</Radio>
							<Text paddingLeft="24px">
								If turned on, only organisers enrolled in the current session will be able to see your profile.
							</Text>
						</Stack>
					</RadioGroup>
					<Spacer x={1} />
					<div>
						<Text marginLeft="15px" fontFamily="sans-serif" fontWeight="500">
							<strong> Show Phone Number to Chair </strong>
						</Text>
						<div className="fdr">
							<Spacer x={1} />
							<Switch onChange={() => set_show_phone_number(!show_phone_number)} size="lg" />
							<Text marginLeft="14px">
								If turned off, only higher management will be able to see your phone number.
							</Text>
						</div>
						<Spacer y={1} />
					</div>
					<div>
						<Text marginLeft="15px" fontFamily="sans-serif" fontWeight="500">
							<strong>
								{" "}
								Allow people who are not ennrolled in your session to message you on the MEDIMUN platform.{" "}
							</strong>
						</Text>
						<div className="fdr">
							<Spacer x={1} />
							<Switch
								onChange={() => set_allow_public_messaging(!allow_public_messaging)}
								value={allow_public_messaging}
								size="lg"
							/>
							<Text marginLeft="14px">
								If turned on, only people enrolled in the current session of MEDIMUN will be able to message you.
							</Text>
						</div>
						<Spacer y={1} />
					</div>
				</div>
				<Button ml={3} mr={3} onClick={onOpen}>
					Save
				</Button>
				<Button onClick={() => router.push("/")}>Cancel</Button>
			</div>
		</Layout>
	);
}

export async function getServerSideProps(context) {
	const session = await getSession({ req: context.req });

	const user = await prisma.user.findFirst({
		where: {
			userNumber: await session.user.userNumber,
		},
	});

	if (!user) {
		return {
			notFound: true,
		};
	}

	let useDisplayNames = false;

	if (user.display_name || user.display_surname) {
		useDisplayNames = true;
	}

	let usePronouns = false;

	if (user.pronoun1 || user.pronoun2) {
		usePronouns = true;
	}

	var Minio = require("minio");

	var minioClient = new Minio.Client({
		endPoint: "storage-s3.manage.beoz.org",
		useSSL: false,
		accessKey: "admin",
		secretKey: "BPbpMinio2006!",
	});

	return {
		props: {
			official_name: user.officialName,
			official_surname: user.officialSurname,
			display_name: user.displayName,
			display_surname: user.displaySurname,
			pronoun1: user.pronoun1,
			pronoun2: user.pronoun2,
			phone_number: user.phoneNumber,
			email: user.email,
			profile_visibility: user.profileVisibility,
			organiser_profile_visibility: user.organiserProfileVisibility,
			show_phone_number: user.showPhoneNumber,
			allow_public_messaging: user.allowMessagesFromEveryone,
			useDisplayNames: useDisplayNames,
			usePronouns: usePronouns,
			profilePictureLink: await minioClient.presignedGetObject("profile-pictures", `${user.userNumber}`, 6 * 60 * 60),
			coverImageLink: await minioClient.presignedGetObject("cover-images", `${user.userNumber}`, 6 * 60 * 60),
		},
	};
}
