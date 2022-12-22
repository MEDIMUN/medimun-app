import Layout from "../../app-components/layout";
import { Avatar, Input, Text, Switch, Stack, Radio, RadioGroup } from "@chakra-ui/react";
import style from "../../styles/account.module.css";
import prisma from "../../client";
import { getSession } from "next-auth/react";
import { Image, Spacer } from "@nextui-org/react";
import { Button } from "@chakra-ui/react";
import { useState, useRef } from "react";

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function AccountPage(props) {
	const official_name_ref = useRef();
	const official_surname_ref = useRef();
	const [display_names_toggle, set_display_names_toggle] = useState(false);
	const display_name_ref = useRef();
	const display_surname_ref = useRef();
	const pronoun_1_ref = useRef();
	const pronoun_2_ref = useRef();
	const date_of_birth_ref = useRef();
	const [profile_visibility, set_profile_visibility] = useState();
	const [organiser_profile_visibility, set_organiser_profile_visibility] = useState();
	const [show_phone_number, set_show_phone_number] = useState(false);
	const [allow_public_messaging, set_allow_public_messaging] = useState(false);

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

	const [loading, setLoading] = useState(false);

	async function submitHandler() {
		console.log(display_names_toggle);
		setLoading(true);
		official_name = official_name_ref.current.value;
		official_surname = official_surname_ref.current.value;
		display_names_toggle_value = display_names_toggle || "false";
		display_name = display_name_ref.current.value;
		display_surname = display_surname_ref.current.value;
		pronoun_1 = pronoun_1_ref.current.value;
		pronoun_2 = pronoun_2_ref.current.value;
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
	}

	return (
		<Layout>
			<div className={style.page}>
				<div className={style.nameholder}>
					<div className={style.picture}>
						<Avatar
							className={style.pfp}
							borderRadius="25%"
							src="https://avatars.githubusercontent.com/u/90158764?v=4"
						/>
					</div>
				</div>
				<Spacer y={4} />
				<div className={style.section}>
					<Text
						marginLeft="15px"
						fontFamily="sans-serif"
						fontWeight="500">
						<strong> PROFILE PICTURE</strong>
					</Text>
					<Text marginLeft="14px">Clicking Upload automatically saves the profile picture.</Text>

					<div className={style.uploadButtons}>
						<Button>Select Profile Picture</Button>
						<Button>Upload</Button>
					</div>

					<Spacer x={1} />

					<Text
						marginLeft="15px"
						fontFamily="sans-serif"
						fontWeight="500">
						<strong> COVER IMAGE </strong>
					</Text>
					<Text marginLeft="14px">Clicking Upload automatically saves the cover image.</Text>

					<div className={style.uploadButtons}>
						<Button>Select Cover Image</Button>
						<Button>Upload</Button>
					</div>

					<Spacer y={1} />

					<Text
						marginLeft="15px"
						fontFamily="sans-serif"
						fontWeight="500">
						<strong> OFFICIAL NAME </strong>
					</Text>

					<Text
						borderBottom="2.5px solid #FFF"
						paddingLeft="14px">
						Your official name will be used on your certificate and must match the name on your passport.
					</Text>

					<Input
						ref={official_name_ref}
						variant="filled"
						width="calc(100%)"
						placeholder={props.official_name}
					/>

					<Spacer x={1} />

					<Text
						marginLeft="15px"
						marginRight="15px"
						fontFamily="sans-serif"
						fontWeight="500">
						<strong> OFFICIAL SURNAME </strong>
					</Text>

					<Text
						borderBottom="2.5px solid #FFF"
						paddingLeft="14px">
						Your official surname will be used on your certificate and must match the name on your passport.
					</Text>

					<Input
						ref={official_surname_ref}
						variant="filled"
						width="calc(100%)"
						placeholder={props.official_surname}
					/>

					<Spacer y={1} />
					<div>
						<Text
							marginLeft="15px"
							fontFamily="sans-serif"
							fontWeight="500">
							<strong>Use display name and surname</strong>
						</Text>
						<div className="fdr">
							<Spacer x={1} />
							<Switch
								onChange={() => set_display_names_toggle(!display_names_toggle)}
								size="lg"
							/>
							<Text marginLeft="14px">If turned off, yor official name and surname will be used instead.</Text>
						</div>
						<Spacer y={1} />
					</div>
					<Text
						marginLeft="15px"
						fontFamily="sans-serif"
						fontWeight="500">
						<strong> DISPLAY NAME </strong>
					</Text>

					<Text
						borderBottom="2.5px solid #FFF"
						paddingLeft="14px">
						If added your display name will be used on your profile and nametag.
					</Text>

					<Input
						ref={display_name_ref}
						variant="filled"
						width="calc(100%)"
						placeholder={props.display_name}
					/>

					<Spacer y={1} />
					<Text
						marginLeft="15px"
						fontFamily="sans-serif"
						fontWeight="500">
						<strong> DISPLAY SURNAME </strong>
					</Text>
					<Text
						borderBottom="2.5px solid #FFF"
						paddingLeft="14px">
						If added your display surname will be used on your profile and nametag.
					</Text>

					<Input
						ref={display_surname_ref}
						variant="filled"
						width="calc(100%)"
						placeholder={props.display_surname}
					/>

					<Spacer y={1} />

					<Text
						marginLeft="15px"
						fontFamily="sans-serif"
						fontWeight="500">
						<strong> PRONOUNS </strong>
					</Text>

					<Text
						borderBottom="2.5px solid #FFF"
						paddingLeft="14px">
						Your pronouns will be used on your profile and nametag in the future as this feature is experimental and will be used in the 19<sup>th</sup> Session
						of MEDIMUN.
					</Text>

					<div>
						<Input
							ref={pronoun_1_ref}
							borderRadius="5px 0 0 5px"
							variant="filled"
							width="calc(50%)"
							borderRight="2px solid #e2e8f0"
							placeholder={props.pronoun1}
						/>
						<Input
							ref={pronoun_2_ref}
							borderRadius="0 5px 5px 0"
							variant="filled"
							width="calc(50%)"
							placeholder={props.pronoun2}
						/>
					</div>
					<Spacer x={1} />
					<Text
						marginLeft="15px"
						fontFamily="sans-serif"
						fontWeight="500">
						<strong> DATE OF BIRTH </strong>
					</Text>
					<Text
						borderBottom="2.5px solid #FFF"
						paddingLeft="14px">
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
					<Text
						marginLeft="15px"
						fontFamily="sans-serif"
						fontWeight="500">
						<strong> PROFILE VISIBILITY</strong>
					</Text>
					<Text
						marginLeft="14px"
						borderBottom="2.5px solid #FFF">
						Your choice may eb disregarded if you are enrolled in the current session of MEDIMUN.{" "}
					</Text>

					<RadioGroup
						onChange={set_profile_visibility}
						backgroundColor="#EDF2F7"
						borderRadius="5px"
						padding="10px"
						marginLeft="4px"
						defaultValue="3">
						<Stack>
							<Radio value="1">Public Profile</Radio>
							<Text
								borderBottom="2.5px solid #FFF"
								paddingLeft="24px">
								If turned on, everyone including people without a MEDIMUN account will be able to see your profile.
							</Text>
							<Radio value="2">Internal Only Profile</Radio>
							<Text
								borderBottom="2.5px solid #FFF"
								paddingLeft="24px">
								If turned on, only people with a MEDIMUN account will be able to see your profile.
							</Text>
							<Radio value="3">Session Only Profile</Radio>
							<Text
								borderBottom="2.5px solid #FFF"
								paddingLeft="24px">
								If turned on, only people enrolled in the current session of MEDIMUN will be able to see your profile even after the session ends, if you don
								<span>&apos;</span>t wan<span>&apos;</span>t your profile to be visible after the session ends, please set it to private after the sessions
								ends.
							</Text>
							<Radio value="4">Committee Only Profile</Radio>
							<Text
								borderBottom="2.5px solid #FFF"
								paddingLeft="24px">
								If turned on, only people in your committee will be able to see your profile.
							</Text>
							<Radio value="5">Verified User Only Profile</Radio>
							<Text
								borderBottom="2.5px solid #FFF"
								paddingLeft="24px">
								If turned on, only people currently enrolled or people who had been enrolled in the past will be able to see your profile. People who have a
								MEDIMUN account and have not been enrolled in any session will not be able to see your profile.
							</Text>
							<Radio value="6">Private Profile</Radio>
							<Text paddingLeft="24px">
								If turned on, no one will be able to see your profile. This option is not recommended for currently enrolled participants.
							</Text>
						</Stack>
					</RadioGroup>
					<Spacer y={1} />
					<Text
						marginLeft="15px"
						fontFamily="sans-serif"
						fontWeight="500">
						<strong> PROFILE VISIBILITY OPTIONS FOR ORGANISERS </strong>
					</Text>
					<Text
						borderBottom="2.5px solid #FFF"
						paddingLeft="14px">
						This option determines if an organiser can see your profile. Organisers who are required to see your profile will be able to view your profile no
						matter the profile visibility options you have set.
					</Text>
					<RadioGroup
						onChange={set_organiser_profile_visibility}
						backgroundColor="#EDF2F7"
						borderRadius="5px"
						padding="10px"
						marginLeft="4px"
						defaultValue="3">
						<Stack>
							<Radio value="1">All Organisers</Radio>
							<Text
								borderBottom="2.5px solid #FFF"
								paddingLeft="24px">
								If turned on, all organisers in all sessions will be able to see your profile.
							</Text>
							<Radio value="2">Organisers in Current Session</Radio>
							<Text paddingLeft="24px">If turned on, only organisers enrolled in the current session will be able to see your profile.</Text>
						</Stack>
					</RadioGroup>
					<Spacer x={1} />
					<div>
						<Text
							marginLeft="15px"
							fontFamily="sans-serif"
							fontWeight="500">
							<strong> Show Phone Number to Chair </strong>
						</Text>
						<div className="fdr">
							<Spacer x={1} />
							<Switch
								onChange={() => set_show_phone_number(!show_phone_number)}
								size="lg"
							/>
							<Text marginLeft="14px">If turned off, only higher management will be able to see your phone number.</Text>
						</div>
						<Spacer y={1} />
					</div>
					<div>
						<Text
							marginLeft="15px"
							fontFamily="sans-serif"
							fontWeight="500">
							<strong> Allow people who are not ennrolled in your session to message you on the MEDIMUN platform. </strong>
						</Text>
						<div className="fdr">
							<Spacer x={1} />
							<Switch
								onChange={() => set_allow_public_messaging(!allow_public_messaging)}
								value={allow_public_messaging}
								size="lg"
							/>
							<Text marginLeft="14px">If turned on, only people enrolled in the current session of MEDIMUN will be able to message you.</Text>
						</div>
						<Spacer y={1} />
					</div>
				</div>
				<Button onClick={submitHandler}>Save</Button>
				<Button>Cancel</Button>
			</div>
		</Layout>
	);
}

export async function getServerSideProps(context) {
	const session = await getSession({ req: context.req });

	console.log(session);

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

	console.log(user);

	return {
		props: {
			official_name: user.official_name,
			official_surname: user.official_surname,
			display_name: user.display_name,
			display_surname: user.display_surname,
			pronoun1: user.pronoun1,
			pronoun2: user.pronoun2,
		},
	};
}
