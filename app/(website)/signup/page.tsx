import { Button } from "@/components/button";
import { cn } from "@/lib/cn";
import Link from "next/link";
import SignUpForm from "./client-components";

export default async function Page() {
	const random = Math.floor(Math.random() * 6) + 1;
	return (
		<section
			style={{
				backgroundImage: `url(/assets/gradients/${random.toString()}.jpg)`,
			}}
			className={cn(`flex min-h-dvh w-full bg-cover bg-center align-middle font-[montserrat] duration-300`)}>
			<SignUpForm allowSignUp={process.env.ALLOW_SIGN_UP} />
		</section>
	);
}
