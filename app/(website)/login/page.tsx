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
			className={cn(
				`flex min-h-dvh w-full bg-cover bg-center align-middle font-[montserrat] duration-300`,
				`bg-[url(/gradients/${random.toString()}.jpg)]`
			)}>
			<div className="mx-auto my-auto h-[600px] w-[400px] rounded-md bg-content1/70 p-12 shadow-md md:ml-20">
				<LoginForm />
			</div>
		</section>
	);
}
