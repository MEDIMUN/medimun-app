// pages/api/generate-pdf.js

import { auth } from "@/auth";
import { countries } from "@/data/countries";
import { arrayFromNumber } from "@/lib/array-from-number";
import { authorize, s } from "@/lib/authorize";
import { romanize } from "@/lib/romanize";
import { generateUserDataObject } from "@/lib/user";
import prisma from "@/prisma/client";
import { Prisma } from "@prisma/client";
import { Page, Text, View, Document, StyleSheet, render, Image, Font, Svg, G, Rect, Path, Circle, Link, renderToStream } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";

Font.register({
	family: "Montserrat",
	fonts: [
		{
			src: `${process.cwd()}/public/fonts/Montserrat.ttf`,
			weight: 100,
		},
		{
			src: `${process.cwd()}/public/fonts/Montserrat-ExtraBold.ttf`,
			weight: 800,
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

	const selectedCommitteesList = req.query.committees?.split(",");

	const selectedCommittees = await prisma.committee.findMany({
		where: {
			session: { numberInteger: selectedSessionNumber },
			id: {
				in: selectedCommitteesList,
			},
		},
		orderBy: [{ type: "asc" }, { name: "asc" }],
		include: {
			ExtraCountry: true,
			delegate: {
				include: {
					user: {
						select: {
							officialName: true,
							officialSurname: true,
							displayName: true,
							id: true,
						},
					},
				},
			},
		},
	});

	const processedCommittees = selectedCommittees.map((committee) => {
		const allCountries = countries.concat(committee.ExtraCountry);
		return {
			delegates: committee.delegate
				.map((delegate, index) => {
					const fullName = delegate.user.displayName || `${delegate.user.officialName} ${delegate.user.officialSurname}`;
					const country = allCountries.find((country) => country.countryCode === delegate.country);
					return {
						countryCode: delegate.country,
						countryName: country?.countryNameEn || "N/A",
						fullName,
						committeeName: committee.name,
					};
				})
				.sort((a, b) => a.countryName.localeCompare(b.countryName))
				.map((delegate, index) => {
					return {
						...delegate,
						index: index + 1,
					};
				}),
		};
	});

	const reducedCommittees = processedCommittees.reduce((acc, curr) => {
		return acc.concat(curr.delegates);
	}, []);

	if (reducedCommittees.length === 0) {
		const stream = await renderToStream(<BlankPage />);
		res.setHeader("Content-Type", "application/pdf");
		stream.pipe(res);
		return;
	}

	try {
		const stream = await renderToStream(<MyDocument allDelegates={reducedCommittees} />);

		res.setHeader("Content-Type", "application/pdf");
		if (req.query.download) res.setHeader("Content-Disposition", `attachment; filename="MEDIMUN-Placards.pdf"`);
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

const styles = StyleSheet.create({
	pageBackground: {
		position: "absolute",
		minWidth: "100%",
		minHeight: "100%",
		display: "block",
		height: "100%",
		width: "100%",
	},
});

const tw = createTw({
	theme: { extend: { colors: { primary: "#ae2d28" } } },
});

const itemsPerPage = 8;
const cwd = process.cwd();

type committeeType = Prisma.CommitteeGetPayload<{
	include: {
		ExtraCountry: true;
		delegate: {
			include: {
				user: {
					select: {
						officialName: true;
						officialSurname: true;
						displayName: true;
						id: true;
					};
				};
			};
		};
	};
}>;

function MyDocument({
	allDelegates,
}: {
	allDelegates: {
		countryName: string;
		fullName: string;
		committeeName: string;
		index: number;
		countryCode: string;
	};
}) {
	const numberOfPages = allDelegates.length;

	return (
		<Document>
			{allDelegates.map(
				(
					delegate: {
						countryName: string;
						fullName: string;
						committeeName: string;
						index: number;
						countryCode: string;
					},
					index
				) => (
					<Page key={index} size="A3" orientation="landscape" style={tw("bg-white h-full")}>
						<View style={{ display: "flex", height: "100%", width: "100%", position: "relative" }}>
							<Image alt="background" style={styles.pageBackground} src={`${cwd}/public/assets/pdf/placards/background.png`}></Image>
						</View>
						<View style={tw("flex absolute top-0 w-full rotate-180 h-[50%] items-center justify-center")}>
							<Text style={{ ...tw("font-extrabold px-2 text-center  font-[Montserrat] translate-y-[-30px] text-[125px]"), lineHeight: delegate.countryName.toUpperCase().includes("(") ? "125px" : "100px" }}>
								{delegate.countryName.toUpperCase()}
							</Text>
						</View>
						<View style={tw("flex absolute bottom-0 w-full h-[50%] items-center align-middle justify-center")}>
							<Text style={{ ...tw("font-extrabold px-2 text-center font-[Montserrat] translate-y-[-30px] text-[125px]"), lineHeight: delegate.countryName.toUpperCase().includes("(") ? "125px" : "100px" }}>
								{delegate.countryName.toUpperCase()}
							</Text>
						</View>
						<View style={tw("absolute flex-row flex bottom-0 font-thin font-[Montserrat] text-sm right-0 p-8")}>
							<Text>
								{delegate.fullName} | {delegate.committeeName}
							</Text>
							<View style={tw("ml-2 bg-black font-extrabold text-white px-2 rounded-md")}>
								<Text>{delegate.index.toString().padStart(5, "0")}</Text>
							</View>
						</View>
					</Page>
				)
			)}
		</Document>
	);
}
