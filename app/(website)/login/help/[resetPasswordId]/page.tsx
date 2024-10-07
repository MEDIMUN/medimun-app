import { Suspense } from "react";
import { cn } from "@/lib/cn";
import { ConfirmResetPasswordForm } from "./client-components";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";

export const metadata = {
	title: "Password Reset",
	description: "Reset your MediBook password.",
};

export default async function Page({ params }) {
	const random = Math.floor(Math.random() * 6) + 1;
	const resetPasswordId = params.resetPasswordId;
	const selectedReset = await prisma.resetPassword
		.findFirstOrThrow({ where: { passwordResetCode: resetPasswordId }, select: { passwordResetCode: true } })
		.catch(notFound);
	return (
		<section
			style={{
				backgroundImage: `url(/assets/gradients/${random.toString()}.jpg)`,
			}}
			className={cn(
				`-bg-gradient-to-tr flex min-h-dvh w-full from-zinc-300 to-white bg-cover bg-center align-middle font-[montserrat] duration-300`
			)}>
			<div className="mx-auto my-auto h-[640px] w-[400px] rounded-2xl bg-content1/70 p-12 shadow-lg md:ml-20">
				<Suspense fallback={<div>Loading...</div>}>
					<ConfirmResetPasswordForm passwordResetCode={selectedReset.passwordResetCode} />
				</Suspense>
			</div>
		</section>
	);
}
