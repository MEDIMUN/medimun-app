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
import { TopBar } from "../../../client-components";
import { MainWrapper } from "../../../server-components";

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
		<>
			<TopBar
				buttonHref={isManagement ? "/medibook/locations" : "/medibook"}
				buttonText={isManagement ? "Locations" : "Home"}
				title={location.name}
				hideSearchBar
				subheading={
					<>
						{location?.state || location?.city}
						{`${location?.state || location?.city ? "," : ""}`} {countryNameEn || "No country specified"}
					</>
				}>
				{isManagement && <EditDeleteLocationButtons locationId={location?.id} />}
			</TopBar>
			<MainWrapper>
				{isVisible && !location.isPublic && (
					<div className="rounded-lg border bg-zinc-100 p-2 text-center text-sm md:text-left">This page is private.</div>
				)}
				{isVisible ? (
					<div>
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
								This location&apos;s visibility is set to &quot;Public&quot;, as soon as you add enough address details this page will be generated
								and made public.
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
			</MainWrapper>
		</>
	);
}
