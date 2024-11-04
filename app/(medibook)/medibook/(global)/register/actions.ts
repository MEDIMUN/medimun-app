"use server";

import prisma from "@/prisma/client";
import { getSocketInstance } from "@/socket/server";

export async function deleteRegUser() {
	const io = getSocketInstance();
	await prisma.morningPresent.deleteMany({ where: { userId: "784101271349" } });
	io?.to("private-user-784101271349").emit("router.refresh");
	//repeat 10 times
}
