// pages/api/generate-pdf.js

import { auth } from "@/auth";
import { countries } from "@/data/countries";
import { arrayFromNumber } from "@/lib/array-from-number";
import { authorize, s } from "@/lib/authorize";
import { romanize } from "@/lib/romanize";
import { generateUserDataObject } from "@/lib/user";
import prisma from "@/prisma/client";
import { Page, Text, View, Document, StyleSheet, render, Image, Font, Svg, G, Rect, Path, Circle, Link, renderToStream } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";

Font.register({
	family: "MADEMirage",
	fonts: [
		{
			src: `${process.cwd()}/public/fonts/MADEMirageBlack.otf`,
			fontWeight: 900,
		},
		{
			src: `${process.cwd()}/public/fonts/MADEMirageBold.otf`,
			fontWeight: 700,
		},
	],
});

export default async function handler(req, res) {
	const authSession = await auth({ req, res });

	if (!authSession) {
		return res.status(401).send("Unauthorized");
	}

	const isManagement = authorize(authSession, [s.management]);

	if (!isManagement) {
		return res.status(403).send("Forbidden");
	}

	const selectedSessionNumber = Number(req.query.session);
	const roles = [
		"delegate",
		"chair",
		"member",
		"manager",
		"schoolDirector",
		"secretaryGeneral",
		"deputySecretaryGeneral",
		"presidentOfTheGeneralAssembly",
		"deputyPresidentOfTheGeneralAssembly",
		"Director",
		"seniorDirector",
	];
	const selectedRoles = req.query.roles?.split(",").filter((role) => roles.includes(role));
	const gapNumber = Number(req.query.gap);
	if (isNaN(gapNumber) || gapNumber < 0 || gapNumber > 10) {
		return res.status(400).send("Invalid gap");
	}

	const selectedSession = await prisma.session
		.findFirstOrThrow({
			where: { numberInteger: selectedSessionNumber },
			include: {
				committee: {
					include: {
						ExtraCountry: true,
					},
				},
			},
		})
		.catch(() => {
			return res.status(404).send("Session not found");
		});

	const usersInSession = await prisma.user.findMany({
		where: {
			OR: [
				...(selectedRoles?.includes("Director") ? [{ Director: { some: {} } }] : []),
				...(selectedRoles?.includes("seniorDirector") ? [{ seniorDirector: { some: {} } }] : []),
				...(selectedRoles?.includes("delegate")
					? [{ delegate: { some: { committee: { session: { numberInteger: selectedSessionNumber } } } } }]
					: []),
				...(selectedRoles?.includes("chair") ? [{ chair: { some: { committee: { session: { numberInteger: selectedSessionNumber } } } } }] : []),
				...(selectedRoles?.includes("member") ? [{ member: { some: { department: { session: { numberInteger: selectedSessionNumber } } } } }] : []),
				...(selectedRoles?.includes("manager") ? [{ manager: { some: { department: { session: { numberInteger: selectedSessionNumber } } } } }] : []),
				...(selectedRoles?.includes("schoolDirector") ? [{ schoolDirector: { some: { session: { numberInteger: selectedSessionNumber } } } }] : []),
				...(selectedRoles?.includes("secretaryGeneral")
					? [{ secretaryGeneral: { some: { session: { numberInteger: selectedSessionNumber } } } }]
					: []),
				...(selectedRoles?.includes("deputySecretaryGeneral")
					? [{ deputySecretaryGeneral: { some: { session: { numberInteger: selectedSessionNumber } } } }]
					: []),
				...(selectedRoles?.includes("presidentOfTheGeneralAssembly")
					? [{ presidentOfTheGeneralAssembly: { some: { session: { numberInteger: selectedSessionNumber } } } }]
					: []),
				...(selectedRoles?.includes("deputyPresidentOfTheGeneralAssembly")
					? [{ deputyPresidentOfTheGeneralAssembly: { some: { session: { numberInteger: selectedSessionNumber } } } }]
					: []),
			],
		},
		select: {
			officialName: true,
			officialSurname: true,
			displayName: true,
			id: true,
			pronouns: true,
			seniorDirector: true,
			Director: true,
			Student: true,
			delegate: {
				where: { committee: { session: { numberInteger: selectedSessionNumber } } },
				include: { committee: { select: { name: true, shortName: true } } },
			},
			chair: {
				where: { committee: { session: { numberInteger: selectedSessionNumber } } },
				include: { committee: { select: { name: true, shortName: true } } },
			},

			member: {
				where: { department: { session: { numberInteger: selectedSessionNumber } } },
				include: { department: { select: { name: true, shortName: true } } },
			},
			manager: {
				where: { department: { session: { numberInteger: selectedSessionNumber } } },
				include: { department: { select: { name: true, shortName: true } } },
			},
			schoolDirector: {
				where: { session: { numberInteger: selectedSessionNumber } },
				include: { school: true },
			},
			secretaryGeneral: { where: { session: { numberInteger: selectedSessionNumber } } },
			presidentOfTheGeneralAssembly: { where: { session: { numberInteger: selectedSessionNumber } } },
			deputySecretaryGeneral: { where: { session: { numberInteger: selectedSessionNumber } } },
			deputyPresidentOfTheGeneralAssembly: { where: { session: { numberInteger: selectedSessionNumber } } },
		},
		orderBy: {
			officialName: "desc",
		},
	});

	const sortedUsers = usersInSession.sort((a, b) => {
		if (!!a.seniorDirector.length) return -1;
		if (!!b.seniorDirector.length) return 1;

		if (!!a.Director.length) return -1;
		if (!!b.Director.length) return 1;

		if (!!a.secretaryGeneral.length) return -1;
		if (!!b.secretaryGeneral.length) return 1;

		if (!!a.presidentOfTheGeneralAssembly.length) return -1;
		if (!!b.presidentOfTheGeneralAssembly.length) return 1;

		if (!!a.deputySecretaryGeneral.length) return -1;
		if (!!b.deputySecretaryGeneral.length) return 1;

		if (!!a.deputyPresidentOfTheGeneralAssembly.length) return -1;
		if (!!b.deputyPresidentOfTheGeneralAssembly.length) return 1;

		if (!!a.manager.length) return -1;
		if (!!b.manager.length) return 1;

		if (!!a.chair.length) return -1;
		if (!!b.chair.length) return 1;

		if (!!a.member.length) return -1;
		if (!!b.member.length) return 1;

		//sort based on committee name

		if (!!a.delegate.length && !!b.delegate.length) {
			if (a.delegate[0].committee.name < b.delegate[0].committee.name) return -1;
			if (a.delegate[0].committee.name > b.delegate[0].committee.name) return 1;
			return 0;
		}

		if (!!a.schoolDirector.length) return -1;
		if (!!b.schoolDirector.length) return 1;

		return 0;
	});

	if (sortedUsers.length === 0) {
		const stream = await renderToStream(<BlankPage />);
		res.setHeader("Content-Type", "application/pdf");
		stream.pipe(res);
		return;
	}

	try {
		const stream = await renderToStream(<MyDocument gapNumber={gapNumber} selectedSession={selectedSession} sortedUsers={sortedUsers} />);

		res.setHeader("Content-Type", "application/pdf");
		if (req.query.download)
			res.setHeader("Content-Disposition", `attachment; filename="MEDIMUN-Session-${romanize(selectedSession.numberInteger)}-Nametags.pdf"`);
		stream.pipe(res);
	} catch (error) {
		const stream = await renderToStream(<BlankPage />);
		res.setHeader("Content-Type", "application/pdf");
		stream.pipe(res);
	}
}

const BlankPage = () => (
	<Document>
		<Page size="A4">
			<View style={tw("flex items-center justify-center")}>
				<Text style={tw("text-4xl")}>No users found</Text>
			</View>
		</Page>
	</Document>
);

const tw = createTw({
	theme: { extend: { colors: { primary: "#ae2d28" } } },
});

const itemsPerPage = 8;
const cwd = process.cwd();

function MyDocument({ sortedUsers, selectedSession, gapNumber }) {
	const numberOfPages = Math.ceil(sortedUsers.length / itemsPerPage);
	const gap = `${gapNumber}mm`;

	return (
		<Document>
			{arrayFromNumber(numberOfPages).map((_, i) => (
				<Page key={i} size="A4" style={tw("bg-white h-full")}>
					<View style={tw("flex flex-col items-center justify-center")}>
						<View style={tw(`flex flex-row flex-wrap w-full p-4 gap-[${gap}] justify-center`)}>
							{sortedUsers.slice(i * itemsPerPage, i * itemsPerPage + itemsPerPage).map((user) => (
								<DelegateNametag selectedSession={selectedSession} user={user} key={user.id} />
							))}
						</View>
					</View>
					<View style={tw("absolute bottom-0 font-[100] font-[MADEMirage] text-sm right-0 p-4")}>
						<Text>
							Mediterranean Model United Nations (MEDIMUN) | MediBook Nametag Maker | Page {i + 1} of {numberOfPages}
						</Text>
					</View>
				</Page>
			))}
		</Document>
	);
}

function DelegateNametag({ user, selectedSession }) {
	const fullName = user.displayName || `${user.officialName} ${user.officialSurname}`;
	let role = "";
	let imageUrl = "";
	let nameColor = "#FFF";
	let roleColor = "#FFF";
	let pronounColor = "#FFF";
	let committeeName = "";

	if (!!user.schoolDirector?.length) {
		role = user.schoolDirector[0].school.name;
		imageUrl = `school-director`;
	}

	if (!!user.delegate?.length) {
		let allCountries = countries;
		let country = allCountries.find((country) => country.countryCode === user.delegate[0].country);
		if (!country) {
			const selectedCommittee = selectedSession.committee.find((committee) => committee.id === user.delegate[0].committeeId);
			allCountries = countries.concat(selectedCommittee.ExtraCountry);
			country = allCountries.find((country) => country.countryCode === user.delegate[0].country);
		}
		role = `${country?.countryNameEn} `;
		committeeName = `${user.delegate[0].committee.shortName || user.delegate[0].committee.name}`;
		imageUrl = `delegate`;
		nameColor = "#AF2D29";
		roleColor = "#AF2D29";
	}

	if (!!user.member?.length) {
		role = user.member[0].department.name;
		imageUrl = `member`;
	}

	if (!!user.manager?.length) {
		role = user.manager[0].department.name;
		imageUrl = `manager`;
	}

	if (!!user.chair?.length) {
		role = user.chair[0].committee.name;
		imageUrl = `chair`;
	}

	//deputyPresidentOfTheGeneralAssembly
	if (!!user.deputyPresidentOfTheGeneralAssembly?.length) {
		role = "Deputy President of the General Assembly";
		imageUrl = `secretariat`;
		nameColor = "#FFF";
		roleColor = "#E8AE58";
	}
	//dsg
	if (!!user.deputySecretaryGeneral?.length) {
		role = "Deputy Secretary-General";
		imageUrl = `secretariat`;
		nameColor = "#FFF";
		roleColor = "#E8AE58";
	}

	//pga
	if (!!user.presidentOfTheGeneralAssembly?.length) {
		role = "President of the General Assembly";
		imageUrl = `secretariat`;
		nameColor = "#FFF";
		roleColor = "#E8AE58";
	}
	//sg
	if (!!user.secretaryGeneral?.length) {
		role = "Secretary-General";
		imageUrl = "secretariat";
		nameColor = "#FFF";
		roleColor = "#E8AE58";
	}

	//director
	if (!!user.Director?.length) {
		role = "Director";
		imageUrl = "board";
		nameColor = "#FFF";
		roleColor = "#E8AE58";
	}
	//seniorDirector
	if (!!user.seniorDirector?.length) {
		role = "Senior Director";
		imageUrl = "board";
		nameColor = "#FFF";
		roleColor = "#E8AE58";
	}

	return (
		<View style={tw("w-[90mm] h-[57mm]")} key={user.id}>
			<Image alt="" src={`${cwd}/public/assets/pdf/nametags/${imageUrl}.png`}></Image>
			<View style={tw("absolute w-full h-full")}>
				<View style={tw("flex w-full mt-[77px] flex-col items-center justify-center")}>
					<Text style={tw(`text-[${nameColor}] text-center font-[MADEMirage] font-[900] text-[17.49px]`)}>{fullName}</Text>
				</View>
				<View style={tw("flex w-full flex-col items-center justify-center")}>
					<View style={tw(`text-[${roleColor}] text-center gap-1 flex flex-row font-[MADEMirage] font-[700] text-[9.28px]`)}>
						<Text>{role}</Text>
						{committeeName && (
							<View style={tw("bg-[#AF2D29] pt-[1px] text-white px-2 -translate-y-[1px] rounded-full")}>
								<Text>{committeeName}</Text>
							</View>
						)}
					</View>
				</View>
				{user?.pronouns && (
					<View style={tw("flex w-full flex-col items-center justify-center")}>
						<Text style={tw(`text-[${roleColor}] text-center font-[MADEMirage] font-[700] text-[9.28px]`)}>{user?.pronouns}</Text>
					</View>
				)}
			</View>
		</View>
	);
}
