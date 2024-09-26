import { Suspense } from "react";
import LoginForm from "./client-components";
import { cn } from "@/lib/cn";

export const metadata = {
	title: "Log In",
	description: "Login to MediBook to access your account.",
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
			<div className="mx-auto my-auto h-[600px] w-[400px] rounded-2xl bg-content1/70 p-12 shadow-lg md:ml-20">
				<Suspense fallback={<div>Loading...</div>}>
					<LoginForm allowLogin={process.env.ALLOW_LOGIN} />
				</Suspense>
			</div>
		</section>
	);
}
