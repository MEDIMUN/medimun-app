import { Suspense } from "react";
import { cn } from "@/lib/cn";
import { ConfirmResetPasswordForm } from "./client-components";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { connection } from "next/server";

export const metadata = {
	title: "Password Reset",
	description: "Reset your MediBook password.",
};

export default async function Page(props) {
	await connection();
	const params = await props.params;
	const resetPasswordId = params.resetPasswordId;
	const selectedReset = await prisma.resetPassword
		.findFirstOrThrow({ where: { passwordResetCode: resetPasswordId }, select: { passwordResetCode: true } })
		.catch(notFound);
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ConfirmResetPasswordForm passwordResetCode={selectedReset.passwordResetCode} />
		</Suspense>
	);
}
