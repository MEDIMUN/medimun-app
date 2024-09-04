import { notFound, redirect } from "next/navigation";
import prisma from "@/prisma/client";
import Image from "next/image";
import Logo from "@/public/assets/branding/logos/logo-white.svg";
import { Input } from "@nextui-org/input";
import { Spacer } from "@nextui-org/spacer";
import Link from "next/link";
import { signIn as signInAction } from "@/auth";
import { LoginButton } from "./buttons";
import { Divider } from "@nextui-org/divider";
import { Button } from "@nextui-org/button";
import Icon from "@/components/icon";
import { cn } from "@/lib/cn";
import LoginESLogo from "@/public/assets/branding/logos/logineslogo.png";
import LoginMediBookLogo from "@/public/assets/branding/logos/miniaturelogo.svg";
import EsLogo from "@/public/assets/branding/logos/eslogo.svg";

export const metadata = {
	title: "Log In",
	description: "Login to MediBook to access your account.",
};

function OrSpacer() {
	return (
		<>
			<Spacer y={3} />
			<div className="flex justify-stretch">
				<Divider className="my-auto w-[40%]" />
				<p className="mx-auto rounded-full bg-content1 px-3 text-xs tracking-widest">OR</p>
				<Divider className="my-auto w-[40%]" />
			</div>
			<Spacer y={3} />
		</>
	);
}

export default async function Page({ searchParams }) {
	const currentSession = await prisma.session
		.findFirst({
			where: {
				isCurrent: true,
			},
			select: {
				number: true,
			},
		})
		.catch(notFound);

	async function signIn(formData: FormData) {
		"use server";
		try {
			await signInAction("credentials", {
				redirectTo: `/medibook/sessions/${currentSession.number}`,
				username: formData.get("username"),
				password: formData.get("password"),
			});
		} catch (error) {
			if (error?.code) redirect(`/login?error=${error?.code}`);
			return;
		}
		redirect(`/medibook/sessions/${currentSession.number}`);
	}

	const randomIntegerFromOneToSix = 3;

	const error = searchParams?.error;

	return (
		<section className={cn(`flex min-h-dvh w-full bg-cover bg-center align-middle font-[montserrat] duration-300`, `bg-[url(/gradients/1.jpg)]`)}>
			<div className="mx-auto my-auto h-[600px] w-[400px] rounded-md bg-content1/70 p-12 shadow-md md:ml-20">
				{searchParams?.type === "englishschool" && (
					<>
						<div className="mx-auto h-14 w-[210px] md:mx-0">
							<Link href="/">
								<Image alt="The English School Logo" src={EsLogo} fill className="!relative" />
							</Link>
						</div>
						<Spacer y={8} />
						<form action={signIn}>
							<Input
								className="animate-appearance-in delay-150"
								name="username"
								classNames={{ label: "text-xs ml-1 !-translate-y-10", input: "text-[16px] md:text-sm" }}
								placeholder="s181143@englishschool.ac.cy"
								radius="sm"
								label="School ID"
								labelPlacement="outside"
							/>
							<Spacer y={5} />
							<Input
								className="animate-appearance-in delay-300"
								name="password"
								classNames={{ label: "text-xs ml-1 !-translate-y-10", input: "text-[16px] md:text-sm" }}
								placeholder="At least 8 characters"
								radius="sm"
								label="Password"
								type="password"
								labelPlacement="outside"
							/>
							{error && <p className="-mb-2 ml-1 mt-2 rounded-full text-xs text-primary">{error}</p>}
							<Spacer y={5} />
							<Link
								target="_blank"
								href="https://ca.englishschool.ac.cy"
								className="-mx-auto ml-1 cursor-pointer text-xs text-content3-foreground hover:text-primary">
								Forgot Password?
							</Link>
							<Spacer y={5} />
							<LoginButton className="bg-[#383f9a]">Login</LoginButton>
							<OrSpacer />
							<Button
								as={Link}
								href="/login"
								startContent={
									<div className="h-6 -translate-x-12">
										<Image alt="MediBook Logo" src={LoginMediBookLogo} fill className="!relative object-cover" />
									</div>
								}
								className={cn("w-full bg-primary text-white")}
								size="md"
								radius="sm"
								type="submit">
								<p className="-translate-x-2">Login with MediBook</p>
							</Button>
						</form>
					</>
				)}
				{searchParams?.type !== "englishschool" && (
					<>
						<div className="mx-auto h-14 w-[180px] md:mx-0">
							<Link href="/">
								<Image alt="MEDIMUN Logo" src={Logo} fill className="!relative" />
							</Link>
						</div>
						<Spacer y={8} />
						<form action={signIn}>
							<Input
								className="animate-appearance-in delay-150"
								name="username"
								classNames={{ label: "text-xs ml-1 !-translate-y-10", input: "text-[16px] md:text-sm" }}
								placeholder="Email, Username, or User ID"
								radius="sm"
								label="Username"
								labelPlacement="outside"
							/>
							<Spacer y={5} />
							<Input
								className="animate-appearance-in delay-300"
								name="password"
								classNames={{ label: "text-xs ml-1 !-translate-y-10", input: "text-[16px] md:text-sm" }}
								placeholder="At least 8 characters"
								radius="sm"
								label="Password"
								type="password"
								labelPlacement="outside"
							/>
							{error && <p className="-mb-2 ml-1 mt-2 rounded-full text-xs text-primary">{error}</p>}
							<Spacer y={5} />
							<Link href="/login/help" className="-mx-auto ml-1 cursor-pointer text-xs text-content3-foreground hover:text-primary">
								Forgot Password?
							</Link>
							<Spacer y={5} />
							<LoginButton className="">Login</LoginButton>
							<OrSpacer />
							<Button
								as={Link}
								href="/login?type=englishschool"
								startContent={
									<div className="h-8 -translate-x-4">
										<Image alt="The English School Logo" src={LoginESLogo} fill className="!relative object-cover" />
									</div>
								}
								className={cn("w-full bg-[#383f9a] text-white")}
								size="md"
								radius="sm"
								type="submit">
								<p className="-translate-x-2">Login with The English School</p>
							</Button>
						</form>
						<Spacer y={8} />
						<div className="flex w-full animate-appearance-in justify-between rounded-small bg-content2 p-3">
							<p className="text-xs">Don&apos;t have an account?</p>
							<Link href="/signup" className="text-xs text-primary">
								Sign Up
							</Link>
						</div>
					</>
				)}
			</div>
		</section>
	);
}
