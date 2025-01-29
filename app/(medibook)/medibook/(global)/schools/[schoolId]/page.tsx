import { auth } from "@/auth";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/description-list";
import { Divider } from "@/components/divider";
import { Subheading } from "@/components/heading";
import { Link } from "@/components/link";
import { countries } from "@/data/countries";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { notFound, redirect } from "next/navigation";
import { EditDeleteSchoolButtons } from "../client-components";
import { TopBar } from "../../../client-components";
import { SchoolSessionActionsList } from "./client-components";
import { MainWrapper } from "@/components/main-wrapper";

export default async function Page(props: { params: Promise<any> }) {
	const params = await props.params;
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);

	const school = await prisma.school
		.findFirstOrThrow({
			where: { OR: [{ id: params.schoolId }, { slug: params.schoolId }] },
			include: { location: true, director: { include: { user: true } } },
		})
		.catch(notFound);

	const currentRoles = authSession?.user?.currentRoles;
	const pastRoles = authSession?.user?.pastRoles;
	const allRoles = currentRoles.concat(pastRoles);

	const userSchoolDirectorRole = allRoles.find((role) => role.schoolId === school.id && role.roleIdentifier === "schoolDirector");
	if (!(userSchoolDirectorRole || isManagement) && (!school || !school.isPublic)) return notFound();
	if (params.schoolId !== school.slug && school.slug) return redirect(`/medibook/schools/${school.slug}`);

	const isManagementOrDirector = isManagement || !!userSchoolDirectorRole;

	const countryNameEn = countries.find((country) => country.countryCode === school?.location?.country)?.countryNameEn;
	const location = school.location;
	const fullAddress = `
   ${location?.name ? `${location?.name}` : ""}
	${location?.street || location?.city || location?.city || location?.zipCode || location?.state || location?.country ? "," : ""}
   ${location?.street ? `${location?.street},` : ""}
   ${location?.city ? `${location?.city},` : ""}
   ${location?.zipCode ? `${location?.zipCode} ` : ""}
   ${location?.state ? `${location?.state},` : ""}
   ${countryNameEn ? `${countryNameEn}` : ""}
   `
		.trim()
		.replace(/ +/g, " ")
		.replace(/[\n\r]+/g, "")
		.replace("&", "and")
		.replace("  ", " ");

	const isVisible =
		location?.email ||
		location?.phone ||
		location?.website ||
		(location?.name && location?.street && location?.zipCode && location?.state && location?.country);

	return (
		<>
			{isVisible && !school.isPublic && (
				<div className="rounded-lg border bg-zinc-100 dark:bg-zinc-900 p-2 text-center text-sm md:text-left">This page is private.</div>
			)}
			<TopBar
				hideBackdrop
				hideSearchBar
				title={school.name}
				buttonText={isManagement ? "Schools" : "Home"}
				buttonHref={isManagement ? "/medibook/schools" : "/medibook"}
				subheading={`${location?.state || location?.city || ""}
                ${`${location?.state || location?.city ? "," : ""}`} ${countryNameEn || "No Address Set"}`}>
				{isManagement && (
					<EditDeleteSchoolButtons
						isManagement={isManagement}
						isDirector={!!userSchoolDirectorRole}
						schoolId={school?.id}
						schoolSlug={school?.slug}
					/>
				)}
			</TopBar>
			<MainWrapper>
				{isVisible ? (
					<div className="mt-4">
						<Subheading>Details</Subheading>
						<Divider className="mt-4" />
						<DescriptionList className="mt-2">
							{school?.email && (
								<>
									<DescriptionTerm>Email</DescriptionTerm>
									<DescriptionDetails>{school?.email}</DescriptionDetails>
								</>
							)}
							{school?.phone && (
								<>
									<DescriptionTerm>Phone</DescriptionTerm>
									<DescriptionDetails>{school?.phone}</DescriptionDetails>
								</>
							)}
							{school?.website && (
								<>
									<DescriptionTerm>Website</DescriptionTerm>
									<Link target="_blank" href={`https://${school?.website}`}>
										<DescriptionDetails>{school?.website}</DescriptionDetails>
									</Link>
								</>
							)}
							{location?.name && location?.street && location?.zipCode && location?.state && location?.country && (
								<>
									<DescriptionTerm>Address</DescriptionTerm>
									<DescriptionDetails>{fullAddress}</DescriptionDetails>
								</>
							)}
						</DescriptionList>
					</div>
				) : (
					<div className="rounded-xl border bg-zinc-100 dark:bg-zinc-900 p-4 text-center text-sm md:text-left">
						This is the public profile page of this school. It&apos;s not available yet as address details haven&apos;t been added.
						{fullAddress && (
							<>
								<br />
								The current full address is <span className="font-semibold">{fullAddress}</span>.
							</>
						)}
						<Divider className="my-2" />
						<span className="text-xs">Only you and management members can see this page.</span>
						{school.isPublic && isManagement && (
							<span className="text-xs">
								<br />
								This school&apos;s visibility is set to &quot;Public&quot;, as soon as you add enough address details this page will be generated and
								made public.
							</span>
						)}
					</div>
				)}
				{location?.name && location?.street && location?.zipCode && location?.state && location?.country && (
					<div className="mt-4">
						<Subheading>Map</Subheading>
						<Divider className="mt-4" />
						<iframe
							width="600"
							height="450"
							loading="lazy"
							className="mt-6 w-full rounded-xl"
							allowFullScreen
							referrerPolicy="no-referrer-when-downgrade"
							src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDMHJLLYDXJgkkua9LIxHh1xyuaWmEjwKA&q=${fullAddress.replace(/ /g, "+")}`}
						/>
					</div>
				)}
				<SchoolSessionActionsList school={school} isManagementOrDirector={isManagementOrDirector} />
			</MainWrapper>
		</>
	);
}
