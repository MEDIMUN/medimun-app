"use server";

import prisma from "@/prisma/client";
import { getSocketInstance } from "@/socket/server";

export async function deleteRegUser() {
	const io = getSocketInstance();
	await prisma.morningPresent.deleteMany({ where: { userId: "784101271349" } });
	//console log connected users
	io?.to("private-user-216897945544").emit("toast.success", "websockets");
	//repeat 10 times
}
