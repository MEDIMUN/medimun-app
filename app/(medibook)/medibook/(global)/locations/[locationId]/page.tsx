import { auth } from "@/auth";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/description-list";
import { Divider } from "@/components/divider";
import { Heading, Subheading } from "@/components/heading";
import { Link } from "@/components/link";
import { countries } from "@/data/countries";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { notFound, redirect } from "next/navigation";
import { EditDeleteLocationButtons } from "../client-components";
import { ChevronLeft } from "lucide-react";

export default async function Page(props) {
	const params = await props.params;
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.management]);

	const location = await prisma.location.findFirst({ where: { OR: [{ id: params.locationId }, { slug: params.locationId }] } });

	if (!location || (!location.isPublic && !isManagement)) {
		return notFound();
	}
	if (params.locationId !== location.slug && location.slug) return redirect(`/medibook/locations/${location.slug}`);

	const countryNameEn = countries.find((country) => country.countryCode === location?.country)?.countryNameEn;
	const fullAddress = `
   ${location?.name ? `${location?.name}` : ""}
	${location.street || location?.city || location?.city || location?.zipCode || location?.state || location?.country ? "," : ""}
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

	if (!isVisible && !authorize(authSession, [s.management])) {
		notFound();
	}

	return (
		<main>
			{authorize(authSession, [s.management]) && (
				<div className="max-lg:hidden -ml-1">
					<Link href="/medibook/locations" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
						<ChevronLeft className="size-4 fill-zinc-400 dark:fill-zinc-500" />
						Locations
					</Link>
				</div>
			)}
			{isVisible && !location.isPublic && (
				<div className="mt-4 rounded-lg border bg-zinc-100 p-2 text-center text-sm md:text-left">This page is private.</div>
			)}
			<div className="mt-4 flex flex-wrap items-end justify-between gap-4">
				<div className="flex flex-wrap items-center gap-6">
					{location.cover && (
						<div className="aspect-[3/2] w-32 shrink-0 rounded-lg p-1 shadow">
							<img className=" aspect-[3/2] rounded-md object-cover " src={`/api/schools/${location.id}/cover`} alt="" />
						</div>
					)}
					<div>
						<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
							<Heading>{location?.name}</Heading>
						</div>
						<div className="mt-2 text-sm/6 text-zinc-500">
							{location?.state || location?.city}
							{`${location?.state || location?.city ? "," : ""}`} {countryNameEn || "Earth"}
						</div>
					</div>
				</div>
				{authorize(authSession, [s.management]) && <EditDeleteLocationButtons locationId={location?.id} />}
			</div>
			{isVisible ? (
				<div className="mt-12">
					<Subheading>Details</Subheading>
					<Divider className="mt-4" />
					<DescriptionList className="mt-2">
						{location?.email && (
							<>
								<DescriptionTerm>Email</DescriptionTerm>
								<DescriptionDetails>{location?.email}</DescriptionDetails>
							</>
						)}
						{location?.phone && (
							<>
								<DescriptionTerm>Phone</DescriptionTerm>
								<DescriptionDetails>{location?.phone}</DescriptionDetails>
							</>
						)}
						{location?.website && (
							<>
								<DescriptionTerm>Website</DescriptionTerm>
								<DescriptionDetails>{location?.website}</DescriptionDetails>
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
					The location page is not available yet as address details haven&apos;t been added.
					<br />
					The current full address is <span className="font-semibold">{fullAddress}</span>.
					<Divider className="my-2" />
					<span className="text-xs">Only you and other management members can see this page.</span>
					{location.isPublic && (
						<span className="text-xs">
							<br />
							This location&apos;s visibility is set to &quot;Public&quot;, as soon as you add enough address details this page will be generated and
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
