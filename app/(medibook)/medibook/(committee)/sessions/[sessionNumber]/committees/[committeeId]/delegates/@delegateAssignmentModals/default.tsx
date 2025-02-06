import prisma from "@/prisma/client";
import { ModalEditDelegateAssignment } from "./modals";
import { auth } from "@/auth";
import { authorize, authorizeChairCommittee, s } from "@/lib/authorize";
import { countries } from "@/data/countries";

export default async function Modals(props) {
	const authSession = await auth();
	if (!authSession) return null;
	const isManagement = authorize(authSession, [s.management]);
	const searchParams = await props.searchParams;
	const params = await props.params;

	if (searchParams["edit-delegate-assignment"]) {
		const selectedCommittee = await prisma.committee.findFirst({
			where: { session: { number: params.sessionNumber }, delegate: { some: { id: searchParams["edit-delegate-assignment"] } } },
			include: { ExtraCountry: true, delegate: true },
		});

		if (!selectedCommittee) return null;

		const selectedDelegate = await prisma.delegate.findFirst({
			where: { id: searchParams["edit-delegate-assignment"] },
			include: { user: true },
		});

		if (!selectedDelegate) return null;

		if (selectedCommittee.type === "GENERALASSEMBLY") {
			if (!isManagement) return null;
			const schoolDelegation = await prisma.applicationGrantedDelegationCountries.findFirst({
				where: { school: { User: { some: { id: selectedDelegate.user.id } } } },
			});

			const filteredMainCountries = countries.filter((country) => schoolDelegation?.countries.some((c) => c === country.countryCode));
			const allCountries = filteredMainCountries.concat(selectedCommittee.ExtraCountry);
			const allNoneAssignedCountries = allCountries
				.filter((country) => !selectedCommittee.delegate.some((delegate) => delegate.country === country.countryCode))
				.concat(allCountries.find((country) => country.countryCode === selectedDelegate.country));
			return <ModalEditDelegateAssignment selectedCommittee={selectedCommittee} allCountries={allNoneAssignedCountries} selectedDelegate={selectedDelegate} />;
		}

		if (selectedCommittee.type === "SPECIALCOMMITTEE") {
			const isChairOfCommittee = authorizeChairCommittee(authSession?.user.currentRoles, selectedCommittee.id);
			if (!isManagement && !isChairOfCommittee) return null;
			const allCountries = selectedCommittee.ExtraCountry;
			const allNoneAssignedCountries = allCountries
				.filter((country) => !selectedCommittee.delegate.some((delegate) => delegate.country === country.countryCode))
				.concat(allCountries.find((country) => country.countryCode === selectedDelegate.country));
			return <ModalEditDelegateAssignment selectedCommittee={selectedCommittee} allCountries={allNoneAssignedCountries} selectedDelegate={selectedDelegate} />;
		}

		if (selectedCommittee.type === "SECURITYCOUNCIL") {
			const isChairOfCommittee = authorizeChairCommittee(authSession?.user.currentRoles, selectedCommittee.id);
			if (!isManagement && !isChairOfCommittee) return null;
			const allCountries = countries.concat(selectedCommittee.ExtraCountry);
			const allNoneAssignedCountries = allCountries
				.filter((country) => !selectedCommittee.delegate.some((delegate) => delegate.country === country.countryCode))
				.concat(allCountries.find((country) => country.countryCode === selectedDelegate.country));
			return <ModalEditDelegateAssignment selectedCommittee={selectedCommittee} allCountries={allNoneAssignedCountries} selectedDelegate={selectedDelegate} />;
		}
	}

	return null;
}
