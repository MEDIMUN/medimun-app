"use server";

import "server-only";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authorize, s } from "@/lib/authorize";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { countries } from "@/data/countries";
import prisma from "@/prisma/client";

export async function addLocation(formData) {
	const session = await getServerSession(authOptions as any);
	if (!authorize(session, [s.management])) redirect("/");
	if (!session) redirect("/");
	const location = {
		name: formData.get("name"),
		slug: formData.get("slug"),
		description: formData.get("description"),
		street: formData.get("street"),
		state: formData.get("state"),
		zipCode: formData.get("zipCode"),
		country: formData.get("country"),
		phoneCode: formData.get("phoneCode") == undefined ? null : formData.get("phoneCode"),
		phoneNumber: formData.get("phoneNumber"),
		email: formData.get("email"),
		website: formData.get("website"),
		mapUrl: formData.get("mapUrl"),
	};

	//validation
	if (!location.name || typeof location.name !== "string") return { ok: false, title: "Name is required", variant: "destructive" };
	if (location.name.length < 2 || location.name.length > 64) return { ok: false, title: "Name must be 2-64 characters long", variant: "destructive" };

	if (location.slug) {
		if (typeof location.slug !== "string") return { ok: false, title: "Slug must be a string", variant: "destructive" };
		if (location.slug.length < 2 || location.slug.length > 50) return { ok: false, title: "Slug must be 2-50 characters long", variant: "destructive" };
		if (!location.slug.match(/^[a-z0-9-]+$/)) return { ok: false, title: "Slug must be alphanumeric", variant: "destructive" };
	}

	if (location.description) {
		if (typeof location.description !== "string") return { ok: false, title: "Description must be a string", variant: "destructive" };
		if (location.description.length < 10 || location.description.length > 500) return { ok: false, title: "Description must be 10-500 characters long", variant: "destructive" };
	}

	if (location.street) {
		if (typeof location.street !== "string") return { ok: false, title: "Street must be a string", variant: "destructive" };
		if (location.street.length < 5 || location.street.length > 100) return { ok: false, title: "Street must be 5-100 characters long", variant: "destructive" };
	}

	if (location.state) {
		if (typeof location.state !== "string") return { ok: false, title: "State must be a string", variant: "destructive" };
		if (location.state.length < 2 || location.state.length > 50) return { ok: false, title: "State must be 2-50 characters long", variant: "destructive" };
	}

	if (location.zipCode) {
		if (typeof location.zipCode !== "string") return { ok: false, title: "Zip code must be a string", variant: "destructive" };
		if (location.zipCode.length < 4 || location.zipCode.length > 10) return { ok: false, title: "Zip code must be 4-10 characters long", variant: "destructive" };
	}

	if (location.country) {
		if (typeof location.country !== "string") return { ok: false, title: "Country must be a string", variant: "destructive" };
		if (!countries.some((country) => country.countryCode === location.country)) {
			return { ok: false, title: "Invalid country", variant: "destructive" };
		}
	}

	if (location.phoneNumber) {
		// Assuming you have a logic to check the validity of phone as it's a custom component.
	}

	if (location.phoneCode) {
		if (typeof location.phoneCode !== "string") return { ok: false, title: "Phone code must be a string", variant: "destructive" };
		const isValidPhoneCode = countries.some((country) => country.countryCallingCode === location.phoneCode);
		if (!isValidPhoneCode) {
			return { ok: false, title: "Invalid phone code", variant: "destructive" };
		}
	}

	//check if there is a phone code there needs to be a number and vice versa if one is empty the other needs to be empty
	if (location.phoneCode && !location.phoneNumber) return { ok: false, title: "Phone number is required", variant: "destructive" };
	if (!location.phoneCode && location.phoneNumber) return { ok: false, title: "Phone code is required", variant: "destructive" };

	if (location.email) {
		if (typeof location.email !== "string") return { ok: false, title: "Email must be a string", variant: "destructive" };
		if (location.email.length < 5 || location.email.length > 100) return { ok: false, title: "Email must be 5-100 characters long", variant: "destructive" };
	}

	if (location.website) {
		if (typeof location.website !== "string") return { ok: false, title: "Website must be a string", variant: "destructive" };
		if (location.website.length < 5 || location.website.length > 200) return { ok: false, title: "Website must be 5-200 characters long", variant: "destructive" };
	}

	if (location.mapUrl) {
		if (typeof location.mapUrl !== "string") return { ok: false, title: "Map URL must be a string", variant: "destructive" };
		if (location.mapUrl.length < 5 || location.mapUrl.length > 200) return { ok: false, title: "Map URL must be 5-200 characters long", variant: "destructive" };
	}

	const editId = formData.get("editId");
	if (editId) {
		try {
			await prisma.location.update({
				where: {
					id: editId,
				},
				data: {
					...location,
				},
			});
		} catch (e) {
			return { ok: false, title: "Something went wrong", variant: "destructive" };
		}
		return { ok: true, title: "Location updated", variant: "default" };
	}
	try {
		await prisma.location.create({
			data: {
				...location,
			},
		});
	} catch (e) {
		return { ok: false, title: "Something went wrong", variant: "destructive" };
	}
	return { ok: true, title: "Location created", variant: "default" };
}

export async function deleteLocation(locationId) {
	const session = await getServerSession(authOptions as any);
	if (!session) notFound();
	if (!authorize(session, [s.management])) notFound();
	await prisma.location.delete({ where: { id: locationId } }).catch();
	return { ok: true, title: "Location deleted", variant: "default" };
}
