import { auth } from "@/auth";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/description-list";
import { Divider } from "@/components/divider";
import { Heading, Subheading } from "@/components/heading";
import { Link } from "@/components/link";
import { countries } from "@/data/countries";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { ChevronLeftIcon } from "@heroicons/react/16/solid";
import { notFound, redirect } from "next/navigation";
import { EditDeleteSchoolButtons } from "../client-components";

export default async function Page({ params }) {
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);

	const school = await prisma.school
		.findFirst({
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
		<main>
			{authorize(authSession, [s.management]) && (
				<div className="max-lg:hidden -ml-1 mb-4">
					<Link href="/medibook/schools" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
						<ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
						Schools
					</Link>
				</div>
			)}
			{isVisible && !school.isPublic && (
				<div className="rounded-lg border bg-zinc-100 p-2 text-center text-sm md:text-left">This page is private.</div>
			)}
			<div className="mt-4 flex flex-wrap items-end justify-between gap-4">
				<div className="flex flex-wrap items-center gap-6">
					{school?.cover && (
						<div className="aspect-[3/2] w-32 shrink-0 rounded-lg p-1 shadow">
							<img className=" aspect-[3/2] rounded-md object-cover " src={`/api/schools/${school.id}/cover`} alt="" />
						</div>
					)}
					<div>
						<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
							<Heading>{school?.name}</Heading>
						</div>
						<div className="mt-2 text-sm/6 text-zinc-500">
							{location?.state || location?.city}
							{`${location?.state || location?.city ? "," : ""}`} {countryNameEn || "Earth"}
						</div>
					</div>
				</div>
				<EditDeleteSchoolButtons isManagement={isManagement} isDirector={!!userSchoolDirectorRole} schoolId={school?.id} schoolSlug={school?.slug} />
			</div>
			{isVisible ? (
				<div className="mt-12">
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
				<div className="mt-8 rounded-lg border bg-zinc-100 p-4 text-center text-sm md:text-left">
					The school page is not available yet as address details haven&apos;t been added.
					<br />
					The current full address is <span className="font-semibold">{fullAddress}</span>.
					<Divider className="my-2" />
					<span className="text-xs">Only you and other management members can see this page.</span>
					{school.isPublic && (
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
						className="mt-6 w-full rounded-sm"
						allowFullScreen
						referrerPolicy="no-referrer-when-downgrade"
						src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDMHJLLYDXJgkkua9LIxHh1xyuaWmEjwKA&q=${fullAddress.replace(/ /g, "+")}`}
					/>
				</div>
			)}
		</main>
	);
}
