import { Suspense } from "react";
import { cn } from "@/lib/cn";
import ResetPasswordForm from "./client-components";

export const metadata = {
	title: "Password Reset",
	description: "Reset your MediBook password.",
};

export default function Page() {
	const random = Math.floor(Math.random() * 6) + 1;
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
					<ResetPasswordForm />
				</Suspense>
			</div>
		</section>
	);
}
