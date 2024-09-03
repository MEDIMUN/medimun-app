"use client";

import { Button } from "@/components/button";
import { Divider } from "@/components/divider";
import { Description } from "@/components/fieldset";
import { Subheading } from "@/components/heading";
import { Input } from "@/components/input";
import { Listbox, ListboxLabel, ListboxOption } from "@/components/listbox";
import { Text } from "@/components/text";
import { Textarea } from "@/components/textarea";
import { countries } from "@/data/countries";
import { entityCase } from "@/lib/text";
import { useEffect, useState } from "react";
import {
	sessionCountriesChange,
	sessionNumbersChange,
	setCurrentSession,
	setFullyVisibleSession,
	setPartiallyVisibleSession,
	updateSession,
	updateSessionPrices,
	updateSessionTexts,
} from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/badge";
import { authorize, s } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { Combobox, ComboboxOption } from "@/components/combobox";
import { permamentSCMembers } from "@/data/constants";

/* model Session {
   id                                   String                                @id @unique @default(nanoid())
   //
   isVisibleToSecretariat               Boolean                               @default(false)
   isVisibleToSchoolDirectors           Boolean                               @default(false)
   isVisibleToManagersAndChairs         Boolean                               @default(false)
   isPublished                          Boolean                               @default(false)
   isCurrent                            Boolean                               @default(false)
   //
   isSecretariatApplicationsForceOpen   Boolean                               @default(false)
   isSecretariatApplicationsAutoOpen    Boolean                               @default(false)
   secretariatApplicationsAutoOpenTime  DateTime?
   secretariatApplicationsAutoCloseTime DateTime?
   //
   isChairAplicationsForceOpen          Boolean                               @default(false)
   isChairApplicationsAutoOpen          Boolean                               @default(false)
   chairApplicationsAutoOpenTime        DateTime?
   chairApplicationsAutoCloseTime       DateTime?
   //
   isDelegateApplicationsForceOpen      Boolean                               @default(false)
   isDelegateApplicationsAutoOpen       Boolean                               @default(false)
   delegateApplicationsAutoOpenTime     DateTime?
   delegateApplicationsAutoCloseTime    DateTime?
   //
   isMemberApplicationsForceOpen        Boolean                               @default(false)
   isMemberApplicationsAutoOpen         Boolean                               @default(false)
   memberApplicationsAutoOpenTime       DateTime?
   memberApplicationsAutoCloseTime      DateTime?
   //
   isManagerApplicationsForceOpen       Boolean                               @default(false)
   isManagerApplicationsAutoOpen        Boolean                               @default(false)
   managerApplicationsAutoOpenTime      DateTime?
   managerApplicationsAutoCloseTime     DateTime?
   //
   number                               String                                @unique
   numberInteger                        Int                                   @unique
   //
   theme                                String?
   subTheme                             String?
   //
   description                          String?
   welcomeText                          String?
   about                                String?
   //
   cover                                String?
   //
   committee                            Committee[]
   department                           Department[]
   //
   schoolDirector                       SchoolDirector[]
   Day                                  Day[]
   //
   secretaryGeneral                     SecretaryGeneral[]
   presidentOfTheGeneralAssembly        PresidentOfTheGeneralAssembly[]
   deputySecretaryGeneral               DeputySecretaryGeneral[]
   deputyPresidentOfTheGeneralAssembly  DeputyPresidentOfTheGeneralAssembly[]
   //
   chat                                 Chat[]
   groupChat                            GroupChat[]
   organiser                            Organiser[]
   Announcement                         Announcement[]
   Role                                 Role[]
   Resource                             Resource[]
   //
   data                                 String?
 } */

export function SettingsForm({ selectedSession }) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [theme, setTheme] = useState(selectedSession?.theme);
	const [subTheme, setSubTheme] = useState(selectedSession?.subTheme);
	const { data: authSession } = useSession();
	const [selectedGACountries, setSelectedGACountries] = useState(selectedSession?.countriesOfSession?.join(","));
	const [selectedSCCountries, setSelectedSCCountries] = useState(selectedSession?.securityCouncilCountriesOfYear.join(","));
	const [mounted, setMounted] = useState(false);

	function handleThemeChange(value) {
		let newValue = entityCase(value);
		setTheme(newValue);
	}

	function handleSubThemeChange(value) {
		let newValue = entityCase(value);
		setSubTheme(newValue);
	}

	function resetThemesForm() {
		setTheme(selectedSession?.theme);
		setSubTheme(selectedSession?.subTheme);
	}

	async function handleSubmitThemesForm(formData) {
		setIsLoading(true);
		const res = await updateSession(formData, selectedSession.number);
		if (res?.ok) {
			router.refresh();
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	async function handleSubmitTextsForm(formData) {
		setIsLoading(true);
		const res = await updateSessionTexts(formData, selectedSession.number);
		if (res?.ok) {
			router.refresh();
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	async function handleSubmitPricesForm(formData) {
		setIsLoading(true);
		const res = await updateSessionPrices(formData, selectedSession.number);
		if (res?.ok) {
			router.refresh();
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	async function handleSessionNumbersChange(formData) {
		setIsLoading(true);
		const res = await sessionNumbersChange(formData, selectedSession.number);
		if (res?.ok) {
			router.refresh();
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	async function handleSessionCountriesChange(formData) {
		setIsLoading(true);
		formData.set("generalAssemblyCountries", selectedGACountries);
		formData.set("securityCouncilCountriesOfYear", selectedSCCountries);
		const res = await sessionCountriesChange(formData, selectedSession.number);
		if (res?.ok) {
			router.refresh();
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	async function handleSetCurrent() {
		setIsLoading(true);
		const res = await setCurrentSession(selectedSession.number);
		if (res?.ok) {
			router.refresh();
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	async function handleSetPartiallyVisible() {
		setIsLoading(true);
		const res = await setPartiallyVisibleSession(selectedSession.number);
		if (res?.ok) {
			router.refresh();
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	async function handleSetFullyVisible() {
		setIsLoading(true);
		const res = await setFullyVisibleSession(selectedSession.number);
		if (res?.ok) {
			router.refresh();
			toast.success(res?.message);
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	function handleSessionCountriesChangeListbox(value) {
		value = value.toUpperCase().replace(/[^A-Z,\n]/g, "");

		//slice all countries to 2 characters

		value = value
			.split(/[\n,]+/)
			.map((e) => e.trim().slice(0, 2))
			.join(",");

		setSelectedGACountries(value);
	}

	function handleSessionSCCountriesChangeListbox(value) {
		value = value.toUpperCase().replace(/[^A-Z,\n]/g, "");
		//remove permament SC members
		value = value
			.split(/[\n,]+/)
			.filter((e) => !permamentSCMembers?.includes(e?.trim()?.slice(0, 2)))
			.join(",");
		//add permament SC members to beginning
		value = permamentSCMembers?.join(",") + "," + value;
		//get the first 20 countries
		value = value
			.split(/[\n,]+/)
			.slice(0, 20)
			.join(",");

		setSelectedSCCountries(value);
	}

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return "Loading..."; //fixLoad

	return (
		<>
			<Divider className="my-10 mb-16" />
			{/* @ts-ignore Server Action */}
			<form action={handleSubmitThemesForm} id="themes">
				<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
					<div className="space-y-1">
						<Subheading>Theme</Subheading>
						<Text>
							The theme will appear everywhere including the website and certificates. A theme is required for a session to be made current and can't
							be removed after a theme is made current.
							<br />
							{theme !== selectedSession.theme && (
								<>
									<span className="animate-appearance-in text-red-500">
										Changing the theme will automatically update all certificates, the website and all other places where it apears.
									</span>
									<br />
								</>
							)}
							<em>Min 10, Max 35 characters</em>
						</Text>
					</div>
					<div className="my-auto grid grid-cols-1 gap-6">
						<Input
							value={theme}
							onChange={(e) => handleThemeChange(e.target.value)}
							maxLength={50}
							minLength={10}
							placeholder="Adapting to Today's Tomorrow..."
							name="theme"
							required={selectedSession.isCurrent || selectedSession.isVisible}
						/>
					</div>
				</section>
				<Divider className="my-10" soft />
				<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
					<div className="space-y-1">
						<Subheading>Sub-Theme</Subheading>
						<Text>
							The subtheme will appear everywhere including the website and certificates. It should be a short phrase that complements the theme.
							<br />
							{subTheme !== selectedSession.subTheme && (
								<>
									<span className="animate-appearance-in text-red-500">
										Changing the sub-theme will automatically update all certificates, the website and all other places where it apears.
									</span>
									<br />
								</>
							)}
							<em>Min 10, Max 50 characters</em>
						</Text>
					</div>
					<div className="my-auto grid grid-cols-1">
						<Input
							value={subTheme}
							onChange={(e) => handleSubThemeChange(e.target.value)}
							minLength={10}
							maxLength={50}
							placeholder={"Diplomacy in a Divided World..."}
							name="subTheme"
							required={selectedSession.isCurrent || selectedSession.isPublished}
						/>
					</div>
				</section>
			</form>
			<Divider className="my-10" soft />
			<div className="flex justify-end gap-4">
				<Button form="themes" plain onClick={resetThemesForm} type="reset">
					Cancel
				</Button>
				<Button form="themes" type="submit">
					Save
				</Button>
			</div>
			<Divider className="my-10" soft />
			{/* @ts-ignore Server Action */}
			<form action={handleSubmitTextsForm} id="texts">
				<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
					<div className="space-y-1">
						<Subheading>Welcome Text</Subheading>
						<Text>
							The subtheme will appear everywhere including the website and certificates. It should be a short phrase that complements the theme.
							<br />
							<em>Max 500 characters</em>
						</Text>
					</div>
					<div className="my-auto grid grid-cols-1">
						<Textarea
							defaultValue={selectedSession?.welcomeText}
							maxLength={500}
							name="welcomeText"
							required={selectedSession.isCurrent || selectedSession.isPublished}
							className="min-h-36"
						/>
					</div>
				</section>
				<Divider className="my-10" soft />
				<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
					<div className="space-y-1">
						<Subheading>Description</Subheading>
						<Text>
							The theme will appear everywhere including the website and certificates. A theme is required for a session to be made current and can't
							be removed after a theme is made current.
							<br />
							<em>Max 500 characters</em>
						</Text>
					</div>
					<div className="my-auto grid grid-cols-1 gap-6">
						<Textarea defaultValue={selectedSession?.description} maxLength={500} name="description" className="min-h-36" />
					</div>
				</section>
				<Divider className="my-10" soft />
				<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
					<div className="space-y-1">
						<Subheading>About Session</Subheading>
						<Text>
							The subtheme will appear everywhere including the website and certificates. It should be a short phrase that complements the theme.
							<br />
							<em>Max 2000 characters</em>
						</Text>
					</div>
					<div className="my-auto grid grid-cols-1">
						<Textarea defaultValue={selectedSession?.about} maxLength={2000} name="about" className="min-h-36" />
					</div>
				</section>
			</form>
			<Divider className="my-10" soft />
			<div className="flex justify-end gap-4">
				<Button form="texts" plain type="reset">
					Cancel
				</Button>
				<Button type="submit" form="texts">
					Save
				</Button>
			</div>
			<Divider className="my-10" soft />
			{/* @ts-ignore Server Action */}
			{authorize(authSession, [s.admins, s.sd, s.director]) && (
				<>
					<form action={handleSubmitPricesForm} id="prices">
						<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
							<div className="space-y-1">
								<Subheading>School Director Price</Subheading>
								<Text>
									The price each school director has to pay to participate in the session. This price will be used to calculate the total price for
									the school. Can't be changed after the session is made current or is made fully visible.
									<br />
									<em>Min 1€, Max 9999€</em>
								</Text>
							</div>
							<div className="my-auto grid grid-cols-1">
								<Input
									defaultValue={selectedSession?.directorPrice}
									min={1}
									max={9999}
									type="number"
									name="directorPrice"
									disabled={selectedSession.isPriceLocked || !authorize(authSession, [s.admins, s.sd])}
								/>
							</div>
						</section>
						<Divider className="my-10" soft />
						<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
							<div className="space-y-1">
								<Subheading>Delegate Price</Subheading>
								<Text>
									The price each delegate has to pay to participate in the session. This price will be used to calculate the total price for the
									school. Can't be changed after the session is made current or is made fully visible.
									<br />
									<em>Min 1€, Max 9999€</em>
								</Text>
							</div>
							<div className="my-auto grid grid-cols-1 gap-6">
								<Input
									defaultValue={selectedSession?.delegatePrice}
									min={1}
									max={9999}
									type="number"
									name="delegatePrice"
									disabled={selectedSession.isPriceLocked || !authorize(authSession, [s.admins, s.sd])}
								/>
							</div>
						</section>
					</form>
					<Divider className="my-10" soft />
					<div className="flex justify-end gap-4">
						<Button form="prices" plain type="reset">
							Cancel
						</Button>
						<Button type="submit" form="prices" disabled={selectedSession.isPriceLocked || !authorize(authSession, [s.admins, s.sd])}>
							Save
						</Button>
					</div>
					<Divider className="my-10" soft />
				</>
			)}
			{/* @ts-ignore Server Action */}
			<form action={handleSessionNumbersChange} id="handleSessionNumbersChange">
				<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
					<div className="space-y-1">
						<Subheading>Minimum Delegate Age</Subheading>
						<Text>
							The minimum age a delegate must be to participate in the session. Calculated based on the first conference day.
							<br />
							<em>Min 1, Max 99</em>
						</Text>
					</div>
					<div className="my-auto grid grid-cols-1">
						<Input
							defaultValue={selectedSession?.minimumDelegateAgeOnFirstConferenceDay || 15}
							min={1}
							max={99}
							type="number"
							name="minimumDelegateAgeOnFirstConferenceDay"
							disabled={selectedSession.isPriceLocked || !authorize(authSession, [s.admins, s.sd])}
						/>
					</div>
				</section>
				<Divider className="my-10" soft />
				<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
					<div className="space-y-1">
						<Subheading>Maximum number of Experienced Delegates</Subheading>
						<Text>
							The maximum number of experienced delegates a school can bring to the session for the Security Council and Special Committee.
							<br />
							<em>Min 1, Max 500</em>
						</Text>
					</div>
					<div className="my-auto grid grid-cols-1 gap-6">
						<Input
							defaultValue={selectedSession?.maxNumberOfSecurityCouncilAndSpecialCommitteeDelegatesPerSchool || 2}
							min={1}
							max={500}
							type="number"
							name="maxNumberOfSecurityCouncilAndSpecialCommitteeDelegatesPerSchool"
						/>
					</div>
				</section>
				<Divider className="my-10" soft />
				<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
					<div className="space-y-1">
						<Subheading>Maximum number of General Assembly Delegations</Subheading>
						<Text>
							The maximum number of General Assembly delegations a school can bring to the session. Depending on the number of General Assembly
							committees in the sessions this number corresponds to a different number of delegates calculated by multiplying the number of General
							Assembly committees in the session by the number delegations in the session.
							<br />
							<em>Min 1, Max 500</em>
						</Text>
					</div>
					<div className="my-auto grid grid-cols-1 gap-6">
						<Input
							defaultValue={selectedSession?.maxNumberOfGeneralAssemblyDelegationsPerSchool || 2}
							min={1}
							max={500}
							type="number"
							name="maxNumberOfGeneralAssemblyDelegationsPerSchool"
						/>
					</div>
				</section>
				<Divider className="my-10" soft />
				<div className="flex justify-end gap-4">
					<Button form="handleSessionNumbersChange" plain type="reset">
						Cancel
					</Button>
					<Button
						type="submit"
						form="handleSessionNumbersChange"
						disabled={selectedSession.isPriceLocked || !authorize(authSession, [s.admins, s.sd])}>
						Save
					</Button>
				</div>
			</form>
			<form id="handleSessionCountriesChange" action={handleSessionCountriesChange}>
				<Divider className="my-10" soft />
				<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
					<div className="space-y-1">
						<Subheading>
							General Assembly Countries of Session
							<Badge color="yellow" className="ml-1">
								Level 1 Danger Zone
							</Badge>
						</Subheading>
						<Text>
							The countries that will be available for General Assembly Delegations in the session. If you change this <u>and remove countries</u>{" "}
							after the applications are opened it will cause some applicatons using the old list to be invalid. You can select countries from the
							list or input the two-digit country codes as a comma or new-line separated list.
							<br />
							<em>Min 1, Max 500</em>
						</Text>
					</div>
					<div className="my-auto grid grid-cols-1 gap-6">
						<Textarea value={selectedGACountries} onChange={(e) => handleSessionCountriesChangeListbox(e.target.value)} />
						<Listbox
							placeholder="Country"
							multiple
							value={selectedGACountries?.split(/[\n,]+/)?.map((e) => e?.trim()?.slice(0, 2))}
							onChange={(e) => setSelectedGACountries(e.join(","))}>
							{countries.map((country) => (
								<ListboxOption key={country.countryCode} value={country.countryCode}>
									<img className="w-5 sm:w-4" src={`https://flagcdn.com/40x30/${country.countryCode.toLowerCase()}.webp`} alt="" />
									<ListboxLabel>{country.countryNameEn}</ListboxLabel>
								</ListboxOption>
							))}
						</Listbox>
						<Text>
							{selectedGACountries
								?.split(/[\n,]+/)
								?.filter((e) => countries?.map((country) => country?.countryCode)?.includes(e?.trim()?.slice(0, 2))).length || "None"}
							{" Selected"}
						</Text>
					</div>
				</section>
				<Divider className="my-10" soft />
				<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
					<div className="space-y-1">
						<Subheading>Security Council Countries of Year</Subheading>
						<Text>
							The countries that will be available for Security Council Delegations in the session. If you need to add options such as the USSR to the
							Security Council or to the Special Committees you can do so in the respective Committees' settings. You can select countries from the
							list or input the two-digit country codes as a comma or new-line separated list.
							<br />
							<em>Select 20 Values</em>
						</Text>
					</div>
					<div className="my-auto grid grid-cols-1 gap-6">
						<Textarea value={selectedSCCountries} onChange={(e) => handleSessionSCCountriesChangeListbox(e.target.value)} />
						<Listbox
							placeholder="Country"
							multiple
							value={selectedSCCountries?.split(/[\n,]+/)?.map((e) => e?.trim()?.slice(0, 2))}
							onChange={(e) => setSelectedSCCountries(e.splice(0, 20).join(","))}>
							{countries
								.sort((a, b) => permamentSCMembers?.includes(b?.countryCode) - permamentSCMembers?.includes(a?.countryCode))
								.map((country) => (
									<ListboxOption key={country.countryCode} disabled={permamentSCMembers?.includes(country?.countryCode)} value={country.countryCode}>
										<img className="w-5 sm:w-4" src={`https://flagcdn.com/40x30/${country.countryCode.toLowerCase()}.webp`} alt="" />
										<ListboxLabel>{country.countryNameEn}</ListboxLabel>
									</ListboxOption>
								))}
						</Listbox>
						<Text>
							{selectedSCCountries
								?.split(/[\n,]+/)
								?.filter((e) => countries?.map((country) => country?.countryCode)?.includes(e?.trim()?.slice(0, 2))).length || "None"}
							{" Selected"}
						</Text>
					</div>
				</section>
			</form>
			<Divider className="my-10" soft />
			<div className="flex justify-end gap-4">
				<Button type="submit" form="handleSessionCountriesChange">
					Save
				</Button>
			</div>
			<Divider className="my-10" soft />
			{authorize(authSession, [s.admins, s.sd]) && (
				<form id="dangerousActions">
					{(!selectedSession.isVisible || !selectedSession.isPartiallyVisible) && !selectedSession.isCurrent && (
						<>
							<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
								<div className="space-y-1">
									<Subheading>
										Stage 1: Current Session & Secretariat
										<Badge color="red" className="ml-1">
											Level 3 Danger Zone
										</Badge>
									</Subheading>
									<Text>This action will have the following effects:</Text>
									<ul>
										<li className="flex">
											•<Text className="ml-2"> The current secretariat will lose their powers.</Text>
										</li>
										<li className="flex">
											•<Text className="ml-2"> The new secretariat will gain secretariat powers.</Text>
										</li>
										<li className="flex">
											•
											<Text className="ml-2">
												The previous session will <u>still</u> be displayed as the current one.
											</Text>
										</li>
										<li className="flex">
											•<Text className="ml-2"> The new secretariat will be able to see and edit the session.</Text>
										</li>
										<li className="flex">
											•<Text className="ml-2"> The session will be invisible to everyone other than the management.</Text>
										</li>
									</ul>
								</div>
								<div className="my-auto grid grid-cols-1 gap-6">
									<Button color="red" type="button" onClick={handleSetCurrent} className="md:ml-auto md:max-w-max">
										Set Session as Current
									</Button>
								</div>
							</section>
							<Divider className="my-10" soft />
						</>
					)}
					{!selectedSession.isVisible && !selectedSession.isPartiallyVisible && selectedSession.isCurrent && (
						<>
							<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
								<div className="space-y-1">
									<Subheading>
										Stage 2: Set Partially Visible
										<Badge color="yellow" className="ml-1">
											Level 1 Danger Zone
										</Badge>
									</Subheading>
									<Text>This action will have the following effects:</Text>
									<ul>
										<li className="flex">
											•<Text className="ml-2"> Parts of a session necesarry for applications such as topics will be displayed.</Text>
										</li>
										<li className="flex">
											•<Text className="ml-2"> The theme displayed on the website will change to the current one.</Text>
										</li>
										<li className="flex">
											•<Text className="ml-2"> Session specific parts of the website will be updated.</Text>
										</li>
										<li className="flex">
											•<Text className="ml-2"> This session will appear at the top of lists as the current session.</Text>
										</li>
										<li className="flex">
											•<Text className="ml-2"> Delegate and School Director prices will be locked.</Text>
										</li>
										<li className="flex">
											•
											<Text className="ml-2">
												It is advisable to add session relevant days to the days section before setting the session as partially visible.
											</Text>
										</li>
									</ul>
								</div>
								<div className="my-auto grid grid-cols-1 gap-6">
									<Button color="red" type="button" onClick={handleSetPartiallyVisible} className="md:ml-auto md:max-w-max">
										Set Partially Visible
									</Button>
								</div>
							</section>
							<Divider className="my-10" soft />
						</>
					)}
					{selectedSession.isPartiallyVisible && !selectedSession.isPartiallyVisible && (
						<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
							<div className="space-y-1">
								<Subheading>
									Stage 3: Publish Session
									<Badge color="orange" className="ml-1">
										Level 2 Danger Zone
									</Badge>
								</Subheading>
								<Text>This action will have the following effects:</Text>
								<ul>
									<li className="flex">
										•<Text className="ml-2"> The session will be displayed as the current one on the website.</Text>
									</li>
									<li className="flex">
										•<Text className="ml-2"> Everyone including delegates, members, managers and chairs will be allowed to work.</Text>
									</li>
									<li className="flex">
										•<Text className="ml-2"> No further actions are needed to make the session fully current.</Text>
									</li>
								</ul>
							</div>
							<div className="my-auto grid grid-cols-1 gap-6">
								<Button color="red" type="button" onClick={handleSetFullyVisible} className="md:ml-auto md:max-w-max">
									Set Fully Visible
								</Button>
							</div>
						</section>
					)}
				</form>
			)}
		</>
	);
}
