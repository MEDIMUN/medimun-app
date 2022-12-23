import Layout from "../../app-components/layout";
import Pagelayout from "../../components/page/layout/layout";
import { Grid, Spacer } from "@nextui-org/react";
import UserPage from "../../app-components/pages/users/[user]/user";
import prisma from "../../client";
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
				Delegate: {
					include: {
						committee: true,
						session: { select: { isCurrent: true, conference_session_number: true } },
					},
				},
				CommitteeChair: {
					include: {
						committee: true,
						session: { select: { isCurrent: true, conference_session_number: true } },
					},
				},
				TeamMember: {
					include: {
						team: true,
						session: { select: { isCurrent: true, conference_session_number: true } },
					},
				},
				TeamManager: {
					include: {
						team: true,
						session: { select: { isCurrent: true, conference_session_number: true } },
					},
				},
				SchoolDirector: {
					include: {
						school: true,
						session: { select: { isCurrent: true, conference_session_number: true } },
					},
				},
				Director: {
					include: {
						team: { select: { name: true } },
						session: { select: { isCurrent: true, conference_session_number: true } },
					},
				},
				SeniorDirector: true,
				SchoolMember: { select: { school: { select: { name: true } } } },
				SG: {
					include: {
						session: { select: { isCurrent: true, conference_session_number: true } },
					},
				},
				PGA: {
					include: {
						session: { select: { isCurrent: true, conference_session_number: true } },
					},
				},
				DSG: {
					include: {
						session: { select: { isCurrent: true, conference_session_number: true } },
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
				Delegate: {
					include: {
						committee: true,
						session: { select: { isCurrent: true, conference_session_number: true } },
					},
				},
				CommitteeChair: {
					include: {
						committee: true,
						session: { select: { isCurrent: true, conference_session_number: true } },
					},
				},
				TeamMember: {
					include: {
						team: true,
						session: { select: { isCurrent: true, conference_session_number: true } },
					},
				},
				TeamManager: {
					include: {
						team: true,
						session: { select: { isCurrent: true, conference_session_number: true } },
					},
				},
				SchoolDirector: {
					include: {
						school: true,
						session: { select: { isCurrent: true, conference_session_number: true } },
					},
				},
				Director: {
					include: {
						team: { select: { name: true } },
						session: { select: { isCurrent: true, conference_session_number: true } },
					},
				},
				SeniorDirector: true,
				SchoolMember: { select: { school: { select: { name: true } } } },
				SG: {
					include: {
						session: { select: { isCurrent: true, conference_session_number: true } },
					},
				},
				PGA: {
					include: {
						session: { select: { isCurrent: true, conference_session_number: true } },
					},
				},
				DSG: {
					include: {
						session: { select: { isCurrent: true, conference_session_number: true } },
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
	if (user.Delegate.role !== null)
		delegateRole = user.Delegate.map((delegate) => {
			return {
				role: "Delegate of " + delegate.country + " in " + delegate.committee.name,
				session: "MEDIMUN " + delegate.session.conference_session_number,
				isCurrent: delegate.session.isCurrent,
			};
		});

	if (user.Delegate.role == null)
		delegateRole = user.Delegate.map((delegate) => {
			return {
				role: "Delegate",
				session: "MEDIMUN " + delegate.session.conference_session_number,
				isCurrent: delegate.session.isCurrent,
			};
		});

	let chairRole = user.CommitteeChair.map((chair) => {
		return {
			role: "Chair of " + chair.committee.name,
			session: "MEDIMUN " + chair.session.conference_session_number,
			isCurrent: chair.session.isCurrent,
		};
	});
	let teamMemberRole = user.TeamMember.map((teamMember) => {
		return {
			role: "Member of " + teamMember.team.name,
			session: "MEDIMUN " + teamMember.session.conference_session_number,
			isCurrent: teamMember.session.isCurrent,
		};
	});
	let teamManagerRole = user.TeamManager.map((teamManager) => {
		return {
			role: "Manager of " + teamManager.team.name,
			session: "MEDIMUN " + teamManager.session.conference_session_number,
			isCurrent: teamManager.session.isCurrent,
		};
	});
	let sgRole = user.SG.map((sg) => {
		return {
			role: "Secretary-General",
			session: "MEDIMUN " + sg.session.conference_session_number,
			isCurrent: sg.session.isCurrent,
		};
	});
	let dsgRole = user.DSG.map((dsg) => {
		return {
			role: "Deputy Secretary-General",
			primary: "",
			session: "MEDIMUN " + dsg.session.conference_session_number,
			isCurrent: dsg.session.isCurrent,
		};
	});
	let pgaRole = user.PGA.map((pga) => {
		return {
			role: "President of The General Assembly",
			session: "MEDIMUN " + pga.session.conference_session_number,
			isCurrent: pga.session.isCurrent,
		};
	});
	let schoolDirectorRole = user.SchoolDirector.map((schoolDirector) => {
		return {
			role: "School Director of " + schoolDirector.school.name,
			session: "MEDIMUN " + schoolDirector.session.conference_session_number,
			isCurrent: schoolDirector.session.isCurrent,
		};
	});
	let directorRole = user.Director.map((director) => {
		return {
			role: "Director of " + director.team.name,
			session: "MEDIMUN " + director.session.conference_session_number,
			isCurrent: director.session.isCurrent,
		};
	});
	let seniorDirectorRole = user.SeniorDirector.map((seniorDirector) => {
		return {
			role: "Senior Director",
		};
	});

	const roles = [
		...seniorDirectorRole,
		...sgRole,
		...dsgRole,
		...pgaRole,
		...directorRole,
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

	return {
		props: {
			userinfo: {
				name: user.display_name || user.official_name,
				surname: user.display_surname || user.official_surname,
				username: user.username,
				pronouns: { pronoun1: user.pronoun1, pronoun2: user.pronoun1 },
				nationality: user.nationality,
				school: user.SchoolMember[0].school.name,
			},
			currentroles,
			pastroles,
			profilePictureLink: await minioClient.presignedGetObject("profile-pictures", `${user.userNumber}`, 6 * 60 * 60),
			coverImageLink: await minioClient.presignedGetObject("cover-images", `${user.userNumber}`, 6 * 60 * 60),
		},
	};
}
