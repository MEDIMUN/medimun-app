import { useRouter } from "next/router";
import { getSession, useSession } from "next-auth/react";
import { Fragment, useState, useRef } from "react";
import { Loading, Spacer } from "@nextui-org/react";
import { Text, Card, CardBody, Button, useDisclosure, Modal, ModalOverlay, ModalHeader, ModalCloseButton, ModalBody, ModalContent, FormControl, FormLabel, Input, ModalFooter } from "@chakra-ui/react";
import Layout from "../../app-components/layout";
import Pagelayout from "../../page-components/layout";
import useSWR from "swr";
import style from "../../styles/session.module.css";
import prisma from "../../prisma/client";
import { findUserDetails } from "@lib/user-roles";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function SessionPage(props) {
	const { data: session, status } = useSession();
	const loading = status === "loading";
	const [isLoading, setIsLoading] = useState(true);

	/* 	async function loadMore() {
		const { data, error } = useSWR("/api/sessions", fetcher);
	} */

	if (session) {
		return (
			<Layout>
				<SessionPageContent currentRoles={props.currentRoles} sessions={props.sessions} />
			</Layout>
		);
	}

	if (!session) {
		return (
			<Pagelayout backgroundColor="white">
				<Spacer y={2.5} />
				<SessionPageContent currentRoles={props.currentRoles} sessions={props.sessions} />
			</Pagelayout>
		);
	}
}

export function SessionPageContent({ sessions, currentRoles }) {
	const [loading, setLoading] = useState(false);
	let edit = false;
	const { isOpen, onOpen, onClose } = useDisclosure();
	let currentSessions = sessions.filter((session) => session.isCurrent);
	let pastSessions = sessions.filter((session) => !session.isCurrent);
	const initialRef = useRef(null);
	const finalRef = useRef(null);

	if (currentRoles.includes("Global Admin") || currentRoles.includes("Senior Director") || currentRoles.includes("Secretary-General") || currentRoles.includes("President of the General Assembly")) {
		edit = true;
	}
	const router = useRouter();
	async function createSession() {
		setLoading(true);
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 1500);
		let response;
		try {
			response = await fetch("/api/sessions/create", {
				method: "POST",
				signal: controller.signal,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					number: initialRef.current.value,
				}),
			}).then((res) => res.json());
		} catch (error) {
			return;
		} finally {
			clearTimeout(timeoutId);
			setLoading(false);
			onClose();
			reload();
		}
	}
	function reload() {
		router.replace(router.asPath);
	}

	return (
		<Fragment>
			<Modal ali initialFocusRef={initialRef} finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
				<ModalOverlay className={style.bgw} />
				<ModalContent shadow="none">
					<ModalHeader>Create your account</ModalHeader>
					<ModalBody pb={6}>
						<FormControl>
							<FormLabel>Session Numbers</FormLabel>
							<FormLabel fontWeight={400} fontSize={15}>
								You can edit the session later to add further details
							</FormLabel>
							<Input maxength="2" type="number" ref={initialRef} placeholder="e.g 18" />
						</FormControl>
					</ModalBody>

					<ModalFooter>
						<Button isLoading={loading} onClick={onClose}>
							Cancel
						</Button>
						<Button onClick={createSession} isLoading={loading} colorScheme="blue" ml={3}>
							Save
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
			<div className="fdr d">{edit && <Button onClick={onOpen}>Create</Button>}</div>

			<Text ml={2} fontWeight="600" fontSize="2xl">
				Current Session
			</Text>
			<ul>
				{currentSessions.map((session) => {
					let sup = "th";
					const lastDigit = session.number.toString().slice(session.number.toString().length - 1);
					switch (lastDigit) {
						case "1":
							sup = "st";
							break;
						case "2":
							sup = "nd";
							break;
						case "3":
							sup = "rd";
							break;
						default:
							sup = "th";
					}
					if (session.number == "11" || session.number == "12") {
						sup = "th";
					}
					return (
						<li key={session.number} className={style.sessionCard}>
							<Card>
								<CardBody padding="10px" justifyContent="space-between" alignItems="center" display="flex" flexDirection="row">
									<Text fontWeight={600}>
										{session.number}
										<sup>{sup}</sup> Annual Session
									</Text>
									{edit && (
										<Button
											onClick={() => {
												router.push(`/sessions/${session.number}/edit`);
											}}
											mr="5px"
											ml="auto">
											Edit
										</Button>
									)}
									<Button
										onClick={() => {
											router.push(`/sessions/${session.number}`);
										}}>
										view
									</Button>
								</CardBody>
							</Card>
						</li>
					);
				})}
			</ul>
			<Text ml={2} fontWeight="600" fontSize="2xl">
				Other Sessions
			</Text>
			<ul>
				{pastSessions.map((session) => {
					let sup = "th";
					const lastDigit = session.number.toString().slice(session.number.toString().length - 1);
					switch (lastDigit) {
						case "1":
							sup = "st";
							break;
						case "2":
							sup = "nd";
							break;
						case "3":
							sup = "rd";
							break;
						default:
							sup = "th";
					}
					if (session.number == "11" || session.number == "12") {
						sup = "th";
					}
					return (
						<li key={session.number} className={style.sessionCard}>
							<Card>
								<CardBody padding="10px" justifyContent="space-between" alignItems="center" display="flex" flexDirection="row">
									<Text fontWeight={600}>
										{session.number}
										<sup>{sup}</sup> Annual Session
									</Text>
									{edit && (
										<Button
											onClick={() => {
												router.push(`/sessions/${session.number}/edit`);
											}}
											mr="5px"
											ml="auto">
											Edit
										</Button>
									)}
									<Button
										onClick={() => {
											router.push(`/sessions/${session.number}`);
										}}>
										view
									</Button>
								</CardBody>
							</Card>
						</li>
					);
				})}
			</ul>
		</Fragment>
	);
}

export async function getServerSideProps(context) {
	let sessions;
	const session = await getSession({ req: context.req });
	const userDetails = findUserDetails(session.user.userNumber);
	const currentRoles = (await userDetails).alCurrentRoleNames;

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
			sessions: sessions,
			currentRoles: currentRoles,
		},
	};
}
