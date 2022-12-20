import Layout from "../../components/app/layout/layout";
import Pagelayout from "../../components/page/layout/layout";
import { Grid, Spacer } from "@nextui-org/react";
import UserPage from "../../app-components/pages/users/[user]/user";
import prisma from "../../client";
import { useSession } from "next-auth/react";
import { useState } from "react";

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
		});
	} else if (userquery.match(/^[0-9]+$/) && userquery.length == 10) {
		console.log("User is a number");
		user = await prisma.user.findFirstOrThrow({
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
		const util = require("util");
		console.log(util.inspect(user, { showHidden: false, depth: null, colors: true }));
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

	return {
		props: {
			name: user.display_name || user.official_name,
			surname: user.display_surname || user.official_surname,
			username: user.username,
			pronouns: user.pronouns,
			nationality: user.nationality,
		},
	};
}
