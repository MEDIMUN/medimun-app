import prisma from "@/prisma/client";
import { auth } from "@/auth";
import { countries } from "@/data/countries";
import { ModalCreateOperativeClause, ModalCreatePreambulatoryClause } from "./modals";

export default async function Modals(props) {
	const params = await props.params;
	const searchParams = await props.searchParams;
	const authSession = await auth();
	if (!authSession) return null;

	//create-preambulatory-clause
	if (searchParams["create-preambulatory-clause"]) {
		const selectedAlliance = await prisma.alliance.findUnique({
			where: {
				id: searchParams["create-preambulatory-clause"],
				committee: {
					session: { number: params.sessionNumber },
					OR: [{ delegate: { some: { userId: authSession.user.id } } }, { chair: { some: { userId: authSession.user.id } } }],
				},
			},
			include: {
				topic: true,
				committee: { select: { ExtraCountry: true } },
				AllianceMember: { include: { delegate: { include: { user: true } } } },
				mainSubmitter: { include: { user: true } },
			},
		});

		if (!selectedAlliance) return null;

		const allCountries = countries.concat(selectedAlliance.committee.ExtraCountry);

		const allCountriesInAlliance = allCountries.filter((country) =>
			[...selectedAlliance.AllianceMember, selectedAlliance.mainSubmitter].some((member) => member?.delegate?.country === country.countryCode || member?.country === country.countryCode)
		);

		const allMembersInAlliance = selectedAlliance.AllianceMember.map((member) => member.delegate).concat(selectedAlliance.mainSubmitter);

		if (!selectedAlliance) return null;
		return <ModalCreatePreambulatoryClause allMembersInAlliance={allMembersInAlliance} selectedAlliance={selectedAlliance} allCountriesInAlliance={allCountriesInAlliance} />;
	}

	if (searchParams["create-operative-clause"]) {
		const selectedAlliance = await prisma.alliance.findUnique({
			where: {
				id: searchParams["create-operative-clause"],
				committee: {
					session: { number: params.sessionNumber },
					OR: [{ delegate: { some: { userId: authSession.user.id } } }, { chair: { some: { userId: authSession.user.id } } }],
				},
			},
			include: {
				topic: true,
				committee: { select: { ExtraCountry: true } },
				AllianceMember: { include: { delegate: { include: { user: true } } } },
				mainSubmitter: { include: { user: true } },
			},
		});

		if (!selectedAlliance) return null;

		const allCountries = countries.concat(selectedAlliance.committee.ExtraCountry);

		const allCountriesInAlliance = allCountries.filter((country) =>
			[...selectedAlliance.AllianceMember, selectedAlliance.mainSubmitter].some((member) => member?.delegate?.country === country.countryCode || member?.country === country.countryCode)
		);

		const allMembersInAlliance = selectedAlliance.AllianceMember.map((member) => member.delegate).concat(selectedAlliance.mainSubmitter);

		if (!selectedAlliance) return null;

		return <ModalCreateOperativeClause allMembersInAlliance={allMembersInAlliance} selectedAlliance={selectedAlliance} allCountriesInAlliance={allCountriesInAlliance} />;
	}

	return null;
}
