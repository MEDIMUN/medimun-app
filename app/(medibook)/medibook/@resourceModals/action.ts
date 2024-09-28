"use server";

import { parseFormData } from "@/lib/form";
import { z } from "zod";
import {
	authorizedToEdit,
	authorizedToEditResource,
	greaterScopeList,
	innerScopeList,
	searchParamsGreaterScopeMap,
	useableSearchParams,
} from "./default";
import { auth } from "@/auth";
import { authorize, authorizeChairCommittee, authorizeManagerDepartment, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { randomUUID } from "crypto";
import { minio } from "@/minio/client";

export async function uploadResource(formData: FormData, searchParams: any) {
	const processedFormData = parseFormData(formData);
	const authSession = await auth();
	const minioClient = minio();

	const resourceName = processedFormData.name;
	const resourceIsPrivate = processedFormData.isPrivate;
	const resourceIsPinned = processedFormData.isPinned;
	const resourceIsAnonymous = processedFormData.isAnonymous;
	const resourceDriveUrl = processedFormData.driveUrl;
	const resourceScope = processedFormData.scope.split(",");
	const resourceFile = formData.get("file");

	const resourceEditableData = {
		resourceName,
		resourceIsPrivate,
		resourceIsPinned,
		resourceIsAnonymous,
		resourceDriveUrl,
	};

	const resourceEditableDataSchema = z.object({
		resourceName: z.string().min(2, "Name must be at least 2 characters long").max(50, "Name must at most 50 characters long"),
		resourceIsPrivate: z.boolean(),
		resourceIsPinned: z.boolean(),
		resourceIsAnonymous: z.boolean(),
		resourceDriveUrl: z.string().optional().nullable(),
		resourceFile: z
			.any()
			.refine((files) => files?.[0]?.size <= 30000000, `Max image size is 30MB.`)
			.refine(
				//has "pdf" or "image"
				(files) => {
					const supportedFormats = ["pdf", "jpg", "jpeg", "png"];
					return files?.[0]?.type.includes("pdf") || supportedFormats.some((format) => files?.[0]?.type.includes(format));
				},
				"Only .jpg, .jpeg, .png and .webp formats are supported."
			)
			.optional()
			.nullable(),
	});

	const { data, error } = resourceEditableDataSchema.safeParse(resourceEditableData);
	if (error) {
		return {
			ok: false,
			message: "Invalid Data",
		};
	}

	if (data.resourceDriveUrl && resourceFile) return { ok: false, message: "Resource should have either a file or a drive URL 1" };
	if (!data.resourceDriveUrl && !resourceFile) return { ok: false, message: "Resource should have either a file or a drive URL 2" };

	const isManagement = authorize(authSession, [s.management]);

	const searchParamsGreaterScopeOpen = {
		uploadsessionprospectus: authorize(authSession, [s.admins, s.director, s.sd]),
		uploadglobalresource: isManagement,
		uploadsessionresource: isManagement && searchParams.uploadsessionresource,
		uploadcommitteeresource:
			(isManagement ||
				authorizeChairCommittee([...authSession.user.pastRoles, ...authSession.user.currentRoles], searchParams.uploadcommitteeresource)) &&
			searchParams.uploadcommitteeresource,
		uploaddepartmentresource:
			(isManagement || authorizeManagerDepartment(authSession.user.currentRoles, searchParams.uploaddepartmentresource)) &&
			searchParams.uploaddepartmentresource,
		uploadresource: true,
		uploadsystemresource: authorize(authSession, [s.admins, s.sd]),
	};

	//get keys of searchParams
	const allSearchParamsKeys = Object.keys(searchParams).filter((key) => useableSearchParams.includes(key));
	const currentGreaterScope = searchParamsGreaterScopeMap[allSearchParamsKeys[0]] || [];
	const allowedInnerScope = innerScopeList[currentGreaterScope[0]]?.map((scope) => scope.value);
	const isAllowed = !!searchParamsGreaterScopeOpen[allSearchParamsKeys[0]];
	const filteredSubmittedScope = resourceScope.filter((scope) => allowedInnerScope?.includes(scope));

	if (!filteredSubmittedScope.length) return { ok: false, message: "Unauthorized" };
	if (!isAllowed) return { ok: false, message: "Unauthorized" };

	const customizedData = {
		name: data.resourceName,
		isPrivate: data.resourceIsPrivate,
		isPinned: data.resourceIsPinned,
		isAnonymous: data.resourceIsAnonymous,
		driveUrl: data.resourceDriveUrl,
		scope: filteredSubmittedScope,
		user: { connect: { id: authSession.user.id } },
	};

	if (searchParams.uploadsessionprospectus) {
		customizedData.session = { connect: { number: searchParams.uploadsessionprospectus } };
		if (searchParams.uploadsessionresource || searchParams.uploadcommitteeresource || searchParams.uploaddepartmentresource)
			return { ok: false, message: "Invalid data" };
	}

	if (searchParams.uploadsessionresource) {
		customizedData.session = { connect: { number: searchParams.uploadsessionresource } };
		if (searchParams.uploadsessionprospectus || searchParams.uploadcommitteeresource || searchParams.uploaddepartmentresource)
			return { ok: false, message: "Invalid data" };
	}

	if (searchParams.uploadcommitteeresource) {
		customizedData.committee = { connect: { id: searchParams.uploadcommitteeresource } };
		if (searchParams.uploadsessionprospectus || searchParams.uploadsessionresource || searchParams.uploaddepartmentresource)
			return { ok: false, message: "Invalid data" };
	}

	if (searchParams.uploaddepartmentresource) {
		customizedData.department = { connect: { id: searchParams.uploaddepartmentresource } };
		if (searchParams.uploadsessionprospectus || searchParams.uploadsessionresource || searchParams.uploadcommitteeresource)
			return { ok: false, message: "Invalid data" };
	}

	if (data.resourceDriveUrl) {
		try {
			await prisma.resource.create({
				data: { ...customizedData, driveUrl: data.resourceDriveUrl },
			});
		} catch (e) {
			return { ok: false, message: "Something went wrong. (2)" };
		}
	}
	if (resourceFile) {
		const randomName = randomUUID();
		const file = resourceFile;
		if (!file) return { ok: false, message: "No file selected" };
		const buffer = Buffer.from(await file?.arrayBuffer());
		const fileName = `${randomName}.${file.type.split("/")[1]}`;
		const filePath = `resources/${fileName}`;

		try {
			await prisma.$transaction(
				async (tx) => {
					await tx.resource.create({
						data: {
							name: customizedData.name,
							user: {
								connect: {
									id: authSession.user.id,
								},
							},
							session: customizedData.session,
							committee: customizedData.committee,
							department: customizedData.department,
							scope: customizedData.scope,
							isPrivate: customizedData.isPrivate,
							isPinned: customizedData.isPinned,
							isAnonymous: customizedData.isAnonymous,
							fileId: fileName,
						},
					});
					await minioClient.putObject(process.env.BUCKETNAME, filePath, buffer, null, {
						"Content-Type": file.type,
					});
				},
				{ maxWait: 5000, timeout: 900000 }
			);
		} catch (e) {
			return { ok: false, message: "Something went wrong. (3)" };
		}
	}
	await new Promise((resolve) => setTimeout(resolve, 2000));
	return { ok: true, message: "Resource uploaded" };
}

export async function editResourceDetails(formData: FormData, resourceId: string) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: "Not authorized" };

	const selectedFile = await prisma.resource.findUnique({
		where: { id: resourceId },
		include: { user: true, session: true, department: { include: { session: true } }, committee: { include: { session: true } } },
	});

	const authorzedToEdit = authorizedToEditResource(authSession, selectedFile);
	if (!authorzedToEdit) return { ok: false, message: "Not authorized" };

	const schema = z.object({
		name: z.string().min(2, "Name must be at least 2 characters long").max(50, "Name must at most 50 characters long"),
		isPrivate: z.boolean(),
		isPinned: z.boolean(),
		isAnonymous: z.boolean(),
	});

	const processedFormData = parseFormData(formData);

	const { data, error } = schema.safeParse(processedFormData);

	if (error) return { ok: false, message: "Invalid Data" };

	const updatedResource = {
		name: data.name,
		isPrivate: data.isPrivate,
		isPinned: data.isPinned,
		isAnonymous: data.isAnonymous,
	};

	try {
		await prisma.resource.update({
			where: { id: resourceId },
			data: updatedResource,
		});
	} catch (e) {
		return { ok: false, message: "Something went wrong." };
	}

	return { ok: true, message: "Resource updated" };
}

export async function deleteResourceAction(resourceId: string) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: "Not authorized" };

	const selectedFile = await prisma.resource.findUnique({
		where: { id: resourceId },
		include: { user: true, session: true, department: { include: { session: true } }, committee: { include: { session: true } } },
	});

	const authorzedToEdit = authorizedToEditResource(authSession, selectedFile);
	if (!authorzedToEdit) return { ok: false, message: "Not authorized" };

	if (selectedFile.fileId) {
		const minioClient = minio();
		try {
			await prisma.$transaction(
				async (tx) => {
					await minioClient.removeObject(process.env.BUCKETNAME, `resources/${selectedFile.fileId}`);
					await tx.resource.delete({ where: { id: resourceId } });
				},
				{ maxWait: 5000, timeout: 900000 }
			);
		} catch (e) {
			return { ok: false, message: "Something went wrong." };
		}
	}

	if (!selectedFile.fileId) {
		try {
			await prisma.resource.delete({ where: { id: resourceId } });
		} catch (e) {
			return { ok: false, message: "Something went wrong." };
		}
	}

	return { ok: true, message: "Resource deleted" };
}
