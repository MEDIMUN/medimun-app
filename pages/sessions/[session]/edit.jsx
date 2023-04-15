import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import { findUserDetails } from "@lib/user-roles";
import prisma from "../../../prisma/client";
import { Fragment, useEffect, useRef, useState } from "react";
import Head from "next/head";
import Layout from "../../../app-components/layout";
import { SessionPageContent } from "..";
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, Text, useDisclosure, Button, Input, Toast, Textarea } from "@chakra-ui/react";
import { updateUserProps, updateUser } from "@lib/user-update";

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function EditSession(props) {
	updateUser(props.userUpdate);
	const router = useRouter();
	const { isOpen, onOpen, onClose } = useDisclosure();
	useEffect(() => {
		onOpen();
	}, []);

	const session_number_ref = useRef(props.selectedSession.number);
	const primary_theme_ref = useRef(props.selectedSession.phrase1);
	const secondary_theme_ref = useRef(props.selectedSession.phrase2);
	const welcome_text_ref = useRef(props.selectedSession.welcomeText);
	const description_text_ref = useRef(props.selectedSession.descriptionText);

	const [sessionNumber, setSessionNumber] = useState(props.selectedSession.number);
	const [primaryTheme, setPrimaryTheme] = useState(props.selectedSession.phrase1);
	const [secondaryTheme, setSecondaryTheme] = useState(props.selectedSession.phrase2);
	const [welcomeText, setWelcomeText] = useState(props.selectedSession.welcomeText);
	const [descriptionText, setDescriptionText] = useState(props.selectedSession.descriptionText);

	const [loading, setLoading] = useState(false);

	async function submitHandler() {
		setLoading(true);
		const response = await fetch("/api/sessions/edit", {
			method: "PATCH",
			body: JSON.stringify({
				sessionNumber: session_number_ref.current.value,
				primaryTheme: primary_theme_ref.current.value,
				secondaryTheme: secondary_theme_ref.current.value,
				sessionId: props.selectedSession.id,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		}).catch((err) => {
			console.log(err);
			setLoading(false);
			return;
		});

		const data = await response.json();
		console.log(data);
		setLoading(false);
		onClose();
		router.back();
	}

	return (
		<Layout>
			<Drawer
				onEsc={() => {
					onClose();
					router.back();
				}}
				onOverlayClick={router.back}
				size="sm"
				isOpen={isOpen}
				placement="right"
				onClose={onClose}>
				<DrawerOverlay />
				<DrawerContent>
					<DrawerCloseButton
						onClick={() => {
							router.back();
						}}
					/>
					<DrawerHeader>Create your account</DrawerHeader>

					<DrawerBody>
						<Text>Session number</Text>
						<Input onChange={() => setSessionNumber(session_number_ref.current.value)} ref={session_number_ref} value={sessionNumber} mb={3} placeholder="e.g 18" />

						<Text>Primary theme phrase</Text>
						<Input onChange={() => setPrimaryTheme(primary_theme_ref.current.value)} value={primaryTheme} ref={primary_theme_ref} mb={3} placeholder="e.g Building Resilience" />

						<Text>Secondary theme phrase</Text>
						<Input onChange={() => setSecondaryTheme(secondary_theme_ref.current.value)} value={secondaryTheme} ref={secondary_theme_ref} mb={3} placeholder="e.g A Transformative Agenda" />

						<Text>Session Description</Text>
						<Textarea placeholder="Will be used on the website about section." onChange={() => setDescriptionText(description_text_ref.current.value)} value={descriptionText} mb={3} ref={description_text_ref} />
						<Text>Session Welcome Text</Text>
						<Textarea placeholder="Will be used on the website homepage." onChange={() => setWelcomeText(welcome_text_ref.current.value)} value={welcomeText} mb={3} ref={welcome_text_ref} />
					</DrawerBody>

					<DrawerFooter>
						<Button
							variant="outline"
							mr={3}
							onClick={() => {
								onClose();
								router.back();
							}}>
							Cancel
						</Button>
						<Button onClick={submitHandler} colorScheme="blue">
							Save
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
			<SessionPageContent currentRoles={props.currentRoles} sessions={props.sessions} />
		</Layout>
	);
}

export async function getServerSideProps(context) {
	const userSession = await getSession(context);
	const userDetails = await findUserDetails(userSession.user.userNumber);
	const { session } = context.query;
	let sessions;
	const currentRoles = userDetails.alCurrentRoleNames;

	if (!userSession) {
		return {
			notFound: true,
		};
	}

	if (userDetails.highestCurrentRoleName !== "Global Admin" && userDetails.highestCurrentRoleName !== "Senior Director" && userDetails.highestCurrentRoleName !== "Secretary-Genaral" && userDetails.highestCurrentRoleName !== "President of the General Assembly") {
		return {
			notFound: true,
		};
	}

	const data = await prisma.session.findFirst({
		where: {
			number: parseInt(session),
		},
	});
	try {
		sessions = await prisma.session.findMany({
			take: 25,
			orderBy: {
				number: "desc",
			},
		});
	} catch (error) {
		error();
	}
	return {
		props: {
			selectedSession: data,
			sessions: sessions,
			currentRoles: currentRoles,
			currentRoles: currentRoles,
			userUpdate: await updateUserProps(userDetails),
		},
	};
}
