import Layout from "../../../app-components/layout";
import Pagelayout from "../../../components/page/layout/layout";
import { Grid, Spacer } from "@nextui-org/react";
import UserPage from "../../../app-components/pages/users/[user]/user";
import prisma from "../../../prisma/client";
import { useSession } from "next-auth/react";
import { useState } from "react";
const util = require("util");

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function UsersPage(props) {
	const { data: session, status } = useSession();
	const loading = status === "loading";
	const [isLoading, setIsLoading] = useState(true);

	if (session) {
		console.log("session");
		return (
			<Layout>
				<UserPage props={props} />
			</Layout>
		);
	}

	if (!session) {
		console.log("NO session");
		return (
			<Pagelayout backgroundColor="white">
				<Spacer y={2.5} />
				<UserPage props={props} />
			</Pagelayout>
		);
	}
}

export async function getServerSideProps(context) {
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
		console.log("User is a number");

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

	const roles = [
		...seniorDirectorRole,
		...sgRole,
		...dsgRole,
		...pgaRole,
		...schoolDirectorRole,
		...teamManagerRole,
		...chairRole,
		...teamMemberRole,
		...delegateRole,
	];

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

	var Minio = require("minio");

	var minioClient = new Minio.Client({
		endPoint: "storage-s3.manage.beoz.org",
		useSSL: false,
		accessKey: "admin",
		secretKey: "BPbpMinio2006!",
	});

	let school;

	if (!user.schoolStudent[0]) {
		school = "No School Assigned";
	} else {
		school = user.SchoolMember[0].school.name;
	}

	console.log(pastroles);

	return {
		props: {
			userinfo: {
				name: user.displayName || user.officialName,
				surname: user.displaySurname || user.officialSurname,
				username: user.username,
				pronouns: { pronoun1: user.pronoun1, pronoun2: user.pronoun1 },
				nationality: user.nationality,
				school: school,
			},
			currentroles,
			pastroles,
			profilePictureLink: await minioClient.presignedGetObject("profile-pictures", `${user.userNumber}`, 6 * 60 * 60),
			coverImageLink: await minioClient.presignedGetObject("cover-images", `${user.userNumber}`, 6 * 60 * 60),
		},
	};
}
