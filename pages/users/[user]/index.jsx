import Layout from "../../../app-components/layout";
import Pagelayout from "../../../page-components/layout";
import prisma from "../../../prisma/client";
import { useSession } from "next-auth/react";
import { useState } from "react";
const util = require("util");
import s from "../../../styles/users.module.css";
import { Grid, Image, Spacer, User, Text as TextN } from "@nextui-org/react";
import { Text, Tabs, TabList, TabPanels, Tab, TabPanel, Avatar } from "@chakra-ui/react";
import ProfileBanner from "../../../app-components/ProfileBanner";
import { updateUserProps, updateUser } from "@lib/user-update";
import { findUserDetails } from "@lib/user-roles";
import { getSession } from "next-auth/react";

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function UsersPage(props) {
	const { data: session, status } = useSession();
	const loading = status === "loading";
	const [isLoading, setIsLoading] = useState(true);
	updateUser(props.userUpdate);

	if (session) {
		return (
			<Layout>
				<UserPage props={props} />
			</Layout>
		);
	}

	if (!session) {
		return (
			<Pagelayout backgroundColor="white">
				<Spacer y={2.5} />
				<UserPage props={props} />
			</Pagelayout>
		);
	}
}

function UserPage({ props }) {
	const currentroles = props.currentroles;
	const pastroles = props.pastroles;

	return (
		<div className={s.page}>
			<div className={s.category}>
				<ProfileBanner role={props.userinfo.role} name={props.userinfo.name} country={props.userinfo.nationality} />
			</div>
			<div className={s.category}>
				<Tabs variant="soft-rounded">
					<TabList css={{ paddingLeft: "20px" }}>
						<Tab>Current Roles</Tab>
						<Tab>Past Roles</Tab>
						<Tab>About Me</Tab>
					</TabList>
					<TabPanels>
						<TabPanel>
							<div className={s.rolestab}>
								{currentroles.map((role) => {
									return (
										<div key={role.role}>
											<div className={s.pastRoles}>
												<TextN className={s.rolename} css={{ fontSize: "1.2rem", fontWeight: "$bold" }}>
													{role.role}
												</TextN>
												<TextN className={s.roleSession}>CURRENT</TextN>
											</div>
											<Spacer y={0.1} />
										</div>
									);
								})}
								<Spacer y={1} />
							</div>
						</TabPanel>
						<TabPanel>
							<div className={s.rolestab}>
								{pastroles.map((role) => {
									return (
										<div key={role.role + role.session}>
											<div className={s.pastRoles}>
												<TextN className={s.rolename} css={{ fontSize: "1.2rem", fontWeight: "$bold" }}>
													{role.role}
												</TextN>
												<TextN className={s.pastRoleSession}>{role.session}</TextN>
											</div>
											<Spacer y={0.1} />
										</div>
									);
								})}
								<Spacer y={1} />
							</div>
						</TabPanel>
						<TabPanel>
							<div className={s.bioSection}>
								<p>No biography added yet, this feature is exxperimental, biographies may take time to appear or not appear at all.</p>
							</div>
						</TabPanel>
					</TabPanels>
				</Tabs>
			</div>
		</div>
	);
}

export async function getServerSideProps(context) {
	const session = await getSession({ req: context.req });
	const userDetails = await findUserDetails(await session.user.userNumber);
	const userquery = context.query.user;
	let user;
	if (userquery[0] == "@") {
		user = await prisma.user.findFirst({
			where: {
				username: userquery.slice(1),
			},
			include: {
				delegate: {
					include: {
						committee: true,
						session: {
							select: { isCurrent: true, number: true },
						},
					},
				},
				chair: {
					include: {
						committee: true,
						session: {
							select: { isCurrent: true, number: true },
						},
					},
				},
				member: {
					include: {
						team: true,
						session: {
							select: { isCurrent: true, number: true },
						},
					},
				},
				manager: {
					include: {
						team: true,
						session: {
							select: { isCurrent: true, number: true },
						},
					},
				},
				schoolDirector: {
					include: {
						school: true,
						session: {
							select: { isCurrent: true, number: true },
						},
					},
				},
				seniorDirecor: true,
				schoolStudent: { select: { school: { select: { name: true } } } },
				secretaryGeneral: {
					include: {
						session: {
							select: { isCurrent: true, number: true },
						},
					},
				},
				presidentOfTheGeneralAssembly: {
					include: {
						session: {
							select: { isCurrent: true, number: true },
						},
					},
				},
				deputySecretaryGeneral: {
					include: {
						session: {
							select: { isCurrent: true, number: true },
						},
					},
				},
			},
		});
	} else if (userquery.match(/^[0-9]+$/) && userquery.length == 10) {
		user = await prisma.user.findFirst({
			where: {
				userNumber: userquery,
			},
			include: {
				delegate: {
					include: {
						committee: true,
						session: {
							select: { isCurrent: true, number: true },
						},
					},
				},
				chair: {
					include: {
						committee: true,
						session: {
							select: { isCurrent: true, number: true },
						},
					},
				},
				member: {
					include: {
						team: true,
						session: {
							select: { isCurrent: true, number: true },
						},
					},
				},
				manager: {
					include: {
						team: true,
						session: {
							select: { isCurrent: true, number: true },
						},
					},
				},
				schoolDirector: {
					include: {
						school: true,
						session: {
							select: { isCurrent: true, number: true },
						},
					},
				},
				seniorDirecor: true,
				schoolStudent: { select: { school: { select: { name: true } } } },
				secretaryGeneral: {
					include: {
						session: {
							select: { isCurrent: true, number: true },
						},
					},
				},
				presidentOfTheGeneralAssembly: {
					include: {
						session: {
							select: { isCurrent: true, number: true },
						},
					},
				},
				deputySecretaryGeneral: {
					include: {
						session: {
							select: { isCurrent: true, number: true },
						},
					},
				},
			},
		});

		//console.log(util.inspect(user, { showHidden: false, depth: null, colors: true }));
	} else {
		return {
			notFound: true,
		};
	}

	if (!user) {
		return {
			notFound: true,
		};
	}

	let delegateRole;
	if (user.delegate.role !== null)
		delegateRole = user.delegate.map((delegate) => {
			return {
				role: "Delegate of " + delegate.country + " in " + delegate.committee.name,
				session: "MEDIMUN " + delegate.session.number,
				isCurrent: delegate.session.isCurrent,
			};
		});

	if (user.delegate.role == null)
		delegateRole = user.delegate.map((delegate) => {
			return {
				role: "Delegate",
				session: "MEDIMUN " + delegate.session.number,
				isCurrent: delegate.session.isCurrent,
			};
		});

	let chairRole = user.chair.map((chair) => {
		return {
			role: "Chair of " + chair.committee.name,
			session: "MEDIMUN " + chair.session.number,
			isCurrent: chair.session.isCurrent,
		};
	});
	let teamMemberRole = user.member.map((teamMember) => {
		return {
			role: "Member of " + teamMember.team.name,
			session: "MEDIMUN " + teamMember.session.number,
			isCurrent: teamMember.session.isCurrent,
		};
	});
	let teamManagerRole = user.manager.map((teamManager) => {
		return {
			role: "Manager of " + teamManager.team.name,
			session: "MEDIMUN " + teamManager.session.number,
			isCurrent: teamManager.session.isCurrent,
		};
	});
	let sgRole = user.secretaryGeneral.map((sg) => {
		return {
			role: "Secretary-General",
			session: "MEDIMUN " + sg.session.number,
			isCurrent: sg.session.isCurrent,
		};
	});
	let dsgRole = user.deputySecretaryGeneral.map((dsg) => {
		return {
			role: "Deputy Secretary-General",
			primary: "",
			session: "MEDIMUN " + dsg.session.number,
			isCurrent: dsg.session.isCurrent,
		};
	});
	let pgaRole = user.presidentOfTheGeneralAssembly.map((pga) => {
		return {
			role: "President of The General Assembly",
			session: "MEDIMUN " + pga.session.number,
			isCurrent: pga.session.isCurrent,
		};
	});
	let schoolDirectorRole = user.schoolDirector.map((schoolDirector) => {
		return {
			role: "School Director of " + schoolDirector.school.name,
			session: "MEDIMUN " + schoolDirector.session.number,
			isCurrent: schoolDirector.session.isCurrent,
		};
	});
	let seniorDirectorRole = user.seniorDirecor.map((seniorDirector) => {
		return {
			role: "Senior Director",
			isCurrent: true,
			session: "",
		};
	});

	const roles = [...seniorDirectorRole, ...sgRole, ...dsgRole, ...pgaRole, ...schoolDirectorRole, ...teamManagerRole, ...chairRole, ...teamMemberRole, ...delegateRole];

	const currentroles = roles
		.filter((role) => role.isCurrent)
		.map((role) => {
			return {
				role: role.role,
				session: role.session,
			};
		});
	const pastroles = roles
		.filter((role) => !role.isCurrent)
		.map((role) => {
			return {
				role: role.role,
				session: role.session,
			};
		});

	/* 	var Minio = require("minio");

	var minioClient = new Minio.Client({
		endPoint: "storage-s3.manage.beoz.org",
		useSSL: false,
		accessKey: "admin",
		secretKey: "BPbpMinio2006!",
	}); */

	let school;

	if (!user.schoolStudent[0]) {
		school = "No School Assigned";
	} else {
		school = user.SchoolMember[0].school.name;
	}

	return {
		props: {
			userinfo: {
				name: `${user.displayName || user.officialName} ${!user.displayName ? user.officialSurname : ""}`,
				username: user.username,
				pronouns: { pronoun1: user.pronoun1, pronoun2: user.pronoun1 },
				nationality: user.nationality,
				school: school,
				role: userDetails.highestCurrentRoleName,
			},
			currentroles,
			pastroles,
			/* 			profilePictureLink: await minioClient.presignedGetObject("profile-pictures", `${user.userNumber}`, 6 * 60 * 60),
			coverImageLink: await minioClient.presignedGetObject("cover-images", `${user.userNumber}`, 6 * 60 * 60), */
			profilePictureLink: "/public",
			coverImageLink: "/public",
			userUpdate: await updateUserProps(userDetails),
		},
	};
}
