import { Button } from "@/components/button";
import { Divider } from "@/components/divider";
import { Subheading } from "@/components/heading";
import { Input } from "@/components/input";
import { Code, Text } from "@/components/text";
import { Textarea } from "@/components/textarea";
import type { Metadata } from "next";
import prisma from "@/prisma/client";
import { auth } from "@/auth";
import { Listbox, ListboxLabel, ListboxOption } from "@/components/listbox";
import { countries } from "@/data/countries";
import { notFound, redirect } from "next/navigation";
import { authorize, s } from "@/lib/authorize";
import { ClearBioButton, UsernameField, PrivateProfilePictureUploader } from "./client-components";
import { parseFormData } from "@/lib/parse-form-data";
import { z } from "zod";
import { nameCase, processPronouns } from "@/lib/text";
import Link from "next/link";
import { Select } from "@/components/select";
import { TopBar } from "../../client-components";
import { CircleCheck, X } from "lucide-react";
import { MainWrapper } from "@/components/main-wrapper";

export const metadata: Metadata = {
	title: "User Settings",
};

const genders = [
	{ label: "Female", value: "FEMALE" },
	{ label: "Male", value: "MALE" },
	{ label: "Non-Binary", value: "NONBINARY" },
	{ label: "Other", value: "OTHER" },
	{ label: "Prefer not to Answer", value: "PREFERNOTTOANSWER" },
];

export default async function Settings(props) {
	const searchParams = await props.searchParams;
	const authSession = await auth();
	const selectedUser = await prisma.user
		.findUnique({
			where: {
				id: authSession.user.id,
			},
		})
		.catch(notFound);
	const schools = await prisma.school.findMany({});

	async function handleSubmit(formData: FormData) {
		"use server";
		const schema = z.object({
			officialName: z.string({ required_error: "Official Name is required." }).max(25).trim().transform(nameCase),
			officialSurname: z.string({ required_error: "Official Surname is required." }).max(25).trim().transform(nameCase),
			displayName: z.string().max(50).trim().transform(nameCase).optional().nullable(),
			username: z.string().max(50).trim().optional().nullable(),
			phoneNumber: z
				.string()
				.max(50)
				.trim()
				.transform((v) => v.replace(/\s/g, ""))
				.optional()
				.nullable(),
			schoolId: z.string().optional().nullable(),
			dateOfBirth: z
				.string()
				.transform((v) => new Date(v).toISOString())
				.optional()
				.nullable(),
			nationality: z.string().optional().nullable(),
			pronouns: z.string().max(15).trim().transform(processPronouns).optional().nullable(),
			bio: z.string().max(500).trim().optional().nullable(),
			bestTimeToReach: z.string().max(50).trim().optional().nullable(),
			gender: z.enum(genders.map((x) => x.value)),
		});
		const { data, error } = schema.safeParse(parseFormData(formData));
		if (error) redirect(`?error=${error.errors[0].message}#notice`);
		try {
			await prisma.user.update({
				where: { id: authSession.user.id },
				data,
			});
		} catch (error) {
			redirect("/medibook/account?error=There was a problem updating your details.#notice");
		}
		redirect("/medibook/account?success=Changes saved.#notice"); //FIXME TO INCLUDE THE HASH and MAKE THIS CLIENT SIDE
	}

	function RequiredTag() {
		return <Code color="red">Required</Code>;
	}

	function OptionalTag() {
		return <Code color="yellow">Optional</Code>;
	}

	function RecommendedTag() {
		return <Code color="blue">Recommended</Code>;
	}

	const isAllowedToEditBio = authorize(authSession, [s.management, s.chair, s.manager]);

	return (
		<>
			<TopBar hideBackdrop title="User Settings" hideSearchBar showDivider buttonHref="/medibook" buttonText="Home" />
			<MainWrapper>
				<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
					<div className="space-y-1">
						<Subheading>
							Profile Picture <RecommendedTag />
						</Subheading>
						<Text>
							Inappropriate photos that don&apos;t show your face will be removed. Your profile picture will be visible to everyone. You{" "}
							<b>don&apos;t</b> need to click save.
						</Text>
					</div>
					<div className="my-auto grid gap-6">
						<PrivateProfilePictureUploader user={selectedUser} />
					</div>
				</section>
				<form action={handleSubmit}>
					<Divider className="my-10" />
					<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
						<div className="space-y-1">
							<Subheading>
								Official Name <RequiredTag />
							</Subheading>
							<Text>Your name as it appears on your passport to be used on your certificate.</Text>
						</div>
						<div className="my-auto grid grid-cols-1 gap-6 md:grid-cols-2">
							<Input maxLength={25} placeholder="Official Name" name="officialName" required defaultValue={selectedUser?.officialName} />
							<Input maxLength={25} placeholder="Official Surname" name="officialSurname" required defaultValue={selectedUser?.officialSurname} />
						</div>
					</section>
					<Divider className="my-10" soft />
					<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
						<div className="space-y-1">
							<Subheading>
								Preferred Name & Surname <OptionalTag />
							</Subheading>
							<Text>
								Your preferred name to be used on your name tag, profile and all public places. Leave empty for your official name to be used. This
								must also include a surname.
							</Text>
						</div>
						<div className="my-auto grid grid-cols-1">
							<Input maxLength={50} placeholder="Preferred Name" pattern="(^$|.*\s+.*)" name="displayName" defaultValue={selectedUser?.displayName} />
						</div>
					</section>
					<Divider className="my-10" soft />
					<UsernameField initialUsername={selectedUser?.username} />
					<Divider className="my-10" soft />
					<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
						<div className="space-y-1">
							<Subheading>
								Phone Number <RecommendedTag />
							</Subheading>
							<Text>
								Will only be visible to your chair or manager and management members.
								<br />
								<b>Please include a country code.</b>
							</Text>
						</div>
						<div className="my-auto">
							<Input
								pattern="^\+?[0-9\s]{0,15}$"
								maxLength={50}
								placeholder="Phone Number"
								name="phoneNumber"
								defaultValue={selectedUser?.phoneNumber}
							/>
						</div>
					</section>
					<Divider className="my-10" soft />
					<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
						<div className="space-y-1">
							<Subheading>
								Email Address <RequiredTag />
							</Subheading>
							<Text>Will only be visible to your chair or manager and management members. Contact us to get it changed.</Text>
						</div>
						<div className="my-auto">
							<Input required type="email" disabled defaultValue={selectedUser?.email} />
						</div>
					</section>
					<Divider className="my-10" soft />
					<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
						<div className="space-y-1">
							<Subheading>
								School <RequiredTag />
							</Subheading>
							<Text>
								This will be displayed on your public profile. You need to be currently affiliated with one of the schools to be able to attend.
							</Text>
						</div>
						<div className="my-auto">
							<Listbox defaultValue={selectedUser?.schoolId} name="schoolId" className="col-span-2">
								<ListboxOption key={null} value={null}>
									<ListboxLabel>None</ListboxLabel>
								</ListboxOption>
								{schools.map((school) => (
									<ListboxOption key={school?.id} value={school?.id}>
										<ListboxLabel>{school?.name}</ListboxLabel>
									</ListboxOption>
								))}
							</Listbox>
						</div>
					</section>
					<Divider className="my-10" soft />
					<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
						<div className="space-y-1">
							<Subheading>
								Date of Birth <RequiredTag />
							</Subheading>
							<Text>Will be visile to your chair or manager and management members. It is required to verify your eligibility to attend.</Text>
						</div>
						<div className="my-auto">
							<Input
								name="dateOfBirth"
								type="date"
								defaultValue={selectedUser?.dateOfBirth ? new Date(selectedUser?.dateOfBirth).toISOString().split("T")[0] : undefined}
							/>
						</div>
					</section>
					<Divider className="my-10" soft />
					<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
						<div className="space-y-1">
							<Subheading>
								Nationality <RequiredTag />
							</Subheading>
							<Text>Your primary nationality. Will be visible to everyone.</Text>
						</div>
						<div className="my-auto">
							<Listbox defaultValue={selectedUser?.nationality} name="nationality" placeholder="Country" className="col-span-2">
								{countries.map((country) => (
									<ListboxOption key={country.countryCode} value={country.countryCode}>
										{country.countryCode !== "CY" && <p>{country.flag}</p>}
										<ListboxLabel>{country.nationality || country.countryNameEn}</ListboxLabel>
									</ListboxOption>
								))}
							</Listbox>
						</div>
					</section>
					<Divider className="my-10" soft />
					<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
						<div className="space-y-1">
							<Subheading>
								Gender <RequiredTag />
							</Subheading>
							<Text>Will be visile to management members.</Text>
						</div>
						<div className="my-auto">
							<Select name="gender" defaultValue={selectedUser?.gender || "PREFERNOTTOANSWER"}>
								{genders.map((gender) => (
									<option key={gender.value} value={gender.value}>
										{gender.label}
									</option>
								))}
							</Select>
						</div>
					</section>
					<Divider className="my-10" soft />
					<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
						<div className="space-y-1">
							<Subheading>
								Pronouns <RecommendedTag />
							</Subheading>
							<Text>Will be visile to everyone and will appear on your nametag. Write up to 3 pronouns separated by slashes.</Text>
						</div>
						<div className="my-auto">
							<Input name="pronouns" maxLength={15} defaultValue={selectedUser?.pronouns} />
						</div>
					</section>
					<Divider className="my-10" soft />
					<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
						<div className="space-y-1">
							<Subheading>
								Best Time To Reach <Code color="red">Required for School Directors</Code>
							</Subheading>
							<Text>Best time to reach you over the phone for for non-emergency situations.</Text>
						</div>
						<div className="my-auto">
							<Input name="bestTimeToReach" type="text" defaultValue={selectedUser?.bestTimeToReach} />
						</div>
					</section>
					<Divider className="my-10" soft />
					<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
						<div className="space-y-1">
							<Subheading>
								Biography <OptionalTag />
							</Subheading>
							<Text>
								This will be displayed on your public profile. Maximum 500 characters.
								{!isAllowedToEditBio && !selectedUser?.bio && <span className="text-red-500"> Your role does not allow you to add a biography.</span>}
								{!isAllowedToEditBio && selectedUser?.bio && (
									<span className="text-red-500"> You are no longer allowed to modify your biography, you can only remove the current one.</span>
								)}
							</Text>
						</div>
						<div className="grid grid-cols-1 space-y-2">
							<Textarea name="bio" className="min-h-20" disabled={!isAllowedToEditBio} defaultValue={selectedUser?.bio} />
							{!isAllowedToEditBio && selectedUser?.bio && <ClearBioButton />}
						</div>
					</section>
					<Divider className="my-10" soft />
					{searchParams.error && !searchParams.success && (
						<div id="notice" className="mb-10 rounded-md bg-red-50 p-4">
							<div className="flex">
								<div className="flex-shrink-0">
									<CircleCheck aria-hidden="true" className="h-5 w-5 text-red-400" />
								</div>
								<div className="ml-3">
									<p className="text-sm font-medium text-red-800">{searchParams.error || "Changes saved."}</p>
								</div>
								<div className="ml-auto pl-3">
									<div className="-mx-1.5 -my-1.5">
										<Link href="/medibook/account#notice">
											<button
												type="button"
												className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50">
												<span className="sr-only">Dismiss</span>
												<X aria-hidden="true" className="h-5 w-5" />
											</button>
										</Link>
									</div>
								</div>
							</div>
						</div>
					)}
					{searchParams.success && !searchParams.error && (
						<div id="notice" className="mb-10 rounded-md bg-green-50 p-4">
							<div className="flex">
								<div className="flex-shrink-0">
									<CircleCheck aria-hidden="true" className="h-5 w-5 text-green-400" />
								</div>
								<div className="ml-3">
									<p className="text-sm font-medium text-green-800">{searchParams.success || "Changes saved."}</p>
								</div>
								<div className="ml-auto pl-3">
									<div className="-mx-1.5 -my-1.5">
										<Link href="/medibook/account#notice">
											<button
												type="button"
												className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50">
												<span className="sr-only">Dismiss</span>
												<X aria-hidden="true" className="h-5 w-5" />
											</button>
										</Link>
									</div>
								</div>
							</div>
						</div>
					)}
					<div id="notice" className="flex justify-end gap-4">
						<Button type="submit">Save</Button>
					</div>
				</form>
			</MainWrapper>
		</>
	);
}
