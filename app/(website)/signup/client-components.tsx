"use client";

import { Divider } from "@/components/divider";
import { cn } from "@/lib/cn";
import Image from "next/image";
import Link from "next/link";
import EsLogo from "@/public/assets/branding/logos/eslogo.svg";
import Logo from "@/public/assets/branding/logos/logo-white.svg";
import { Input } from "@/components/input";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
/* import { signIn } from "./action";
 */ import { toast } from "sonner";
import { Button } from "@/components/button";
import { updateSearchParams } from "@/lib/searchParams";
import { Description, Field, Label } from "@/components/fieldset";
import { Text, TextLink } from "@/components/text";
import { approveHalfUser, checkEmail, createNewUser, createPendingUser } from "./actions";
import { OTPInput, SlotProps } from "input-otp";
import { Checkbox, CheckboxField } from "@/components/checkbox";
import Confetti from "react-confetti";
import useWindowDimensions from "@/hooks/useWIndowDimensions";
import { Badge } from "@/components/badge";
import { Select } from "@/components/select";

function OrSpacer() {
	return (
		<div className="my-4 flex justify-stretch gap-1">
			<Divider className="my-auto w-[40%]" />
			<p className="-bg-content1 mx-auto rounded-full px-3 text-xs tracking-widest">OR</p>
			<Divider className="my-auto w-[40%]" />
		</div>
	);
}

function FakeCaret() {
	return (
		<div className="animate-caret-blink pointer-events-none absolute inset-0 flex items-center justify-center">
			<div className="h-8 w-px bg-white" />
		</div>
	);
}

function Slot(props: SlotProps) {
	return (
		<div
			className={cn(
				"relative h-10 w-[44px] bg-white",
				"flex items-center justify-center",
				"transition-all duration-300",
				"border-y border-r border-border first:rounded-l-md first:border-l last:rounded-r-md",
				"group-focus-within:border-accent-foreground/20 group-hover:border-accent-foreground/20",
				"outline outline-0 outline-accent-foreground/20",
				{ "outline-1 outline-primary": props.isActive }
			)}>
			{props.char !== null && <div>{props.char}</div>}
			{props.hasFakeCaret && <FakeCaret />}
		</div>
	);
}

// Inspired by Stripe's MFA input.
function FakeDash() {
	return (
		<div className="flex w-10 items-center justify-center">
			<div className="h-1 w-3 rounded-full border-zinc-100 bg-white" />
		</div>
	);
}

export default function SignUpForm() {
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);
	const [stage, setStage] = useState("START");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [verificationCodeId, setVerificationCodeId] = useState("");
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [verificationCode, setVerificationCode] = useState("");
	const [schools, setSchools] = useState([]);
	const [email, setEmail] = useState("");
	const [acceptedTerms, setAcceptedTerms] = useState(false);
	const { width, height } = useWindowDimensions();

	async function handleStage1() {
		setIsLoading(true);
		const res = await checkEmail(email);

		const data = res.data;
		if (data.stage == "USER_WITH_ACCOUNT") {
			toast.info(...res?.message);
			router.push("/login");
		}
		if (data?.stage == "USER_WITHOUT_ACCOUNT") {
			setStage("USER_WITHOUT_ACCOUNT");
		}
		if (data?.stage == "BLACKLIST") {
			setStage("BLACKLIST");
		}
		if (data.stage == "NO_USER") {
			setStage("NO_USER");
			setSchools(data?.schools ? data.schools : []);
		}
		if (!res?.ok) {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	async function handleHalfVerifyEmail() {
		setIsLoading(true);
		const res = await approveHalfUser(email, verificationCode, password);
		if (res?.ok) {
			setStage("HALF_ACCOUNT_CREATED");
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	async function handleCreateNewPendingUser(formData: FormData) {
		setIsLoading(true);
		const res = await createPendingUser(formData, email);
		if (res?.ok) {
			setStage(res?.data?.stage);
			setVerificationCodeId(res?.data?.id);
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	async function handleCreateNewUser() {
		setIsLoading(true);
		const res = await createNewUser(verificationCodeId, password, verificationCode);
		if (res?.ok) {
			setStage(res?.data?.stage);
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	const isPasswordAtLeast8Characters = password.length >= 8;
	const isPasswordContainUppercase = /[A-Z]/.test(password);
	const isPasswordContainLowercase = /[a-z]/.test(password);
	const isPasswordContainNumber = /[0-9]/.test(password);
	const isPasswordContainSpecialCharacter = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
	const isPasswordValid =
		isPasswordAtLeast8Characters &&
		isPasswordContainUppercase &&
		isPasswordContainLowercase &&
		isPasswordContainNumber &&
		isPasswordContainSpecialCharacter;
	const doPasswordsMatch = password === confirmPassword;

	return (
		<div
			className={cn(
				"mx-auto my-auto h-[600px] w-[400px] rounded-2xl bg-content1/70 p-12 shadow-md duration-1000 md:ml-20",
				stage == "NO_USER" && "h-[800px]"
			)}>
			<div className="mx-auto h-14 w-[180px] md:mx-0">
				<Link href="/">
					<Image alt="MEDIMUN Logo" src={Logo} fill className="!relative" />
				</Link>
			</div>
			{stage === "START" && (
				<form className="flex h-[calc(100%-56px)] flex-col" action={handleStage1}>
					<Field className="mt-8">
						<Label>Email</Label>
						<Description>
							<span className="text-xs">
								If you’ve attended before, kindly use the same email address you registered with or the one provided by your school during your
								previous session registration. <TextLink href="/contact">Contact us</TextLink> if you need help.
							</span>
						</Description>
						<Input
							onChange={(e) => setEmail(e.target.value)}
							value={email}
							className="animate-appearance-in delay-150"
							name="email"
							placeholder="user@email.com"
						/>
					</Field>
					<div className="mt-4 rounded-lg bg-zinc-300/50 p-2">
						<CheckboxField>
							<Label className="!text-[12px] !leading-[16px]">
								I Accept the <TextLink href="/terms">Terms of Service</TextLink>, the <TextLink href="/privacy">Privacy Policy</TextLink> and the{" "}
								<TextLink href="/conduct">Code of Conduct</TextLink>
							</Label>
							<Checkbox onChange={(val) => setAcceptedTerms(val)} checked={acceptedTerms} className="animate-appearance-in delay-200" />
						</CheckboxField>
					</div>
					<Button className="mt-5 w-full" type="submit" color="primary" disabled={isLoading || !acceptedTerms || !email.trim()}>
						Continue
					</Button>
					<div className="mt-auto flex w-full  animate-appearance-in justify-between rounded-small bg-content2 p-3">
						<p className="text-xs">Alredy have an account?</p>
						<Link href="/login" className="text-xs text-primary">
							Log In
						</Link>
					</div>
				</form>
			)}
			{stage === "BLACKLIST" && (
				<div className="flex h-[calc(100%-56px)] flex-col">
					<div className="mt-8 space-y-8">
						<Text>
							Unfortunately, your account appears to be blacklisted and you are unable to proceed with registration. If you think this is a mistake,
							please <TextLink href="/contact">contact us</TextLink>. If you try to register with a different email address, you will be redirected
							again.
						</Text>
						<Button className="w-full" onClick={() => setStage("START")} color="primary">
							Back to Sign Up
						</Button>
					</div>
				</div>
			)}
			{stage === "USER_WITHOUT_ACCOUNT" && (
				<form className="flex h-[calc(100%-56px)] flex-col" action={handleStage1}>
					<Text className="mt-5">It looks like you&apos;ve attended before. Please create a password and to continue.</Text>
					<Field className="mt-5">
						<Label>Password</Label>
						<ul className="mb-3 ml-4 mt-2 list-outside list-disc text-xs">
							<Text className={cn("!text-xs !text-primary duration-150", isPasswordAtLeast8Characters && "!text-green-500")} as="li">
								At least 8 characters long.
							</Text>
							<Text className={cn("!text-xs !text-primary duration-150", isPasswordContainUppercase && "!text-green-500")} as="li">
								Must contain at least one uppercase letter.
							</Text>
							<Text className={cn("!text-xs !text-primary duration-150", isPasswordContainLowercase && "!text-green-500")} as="li">
								Must contain at least one lowercase letter.
							</Text>
							<Text className={cn("!text-xs !text-primary duration-150", isPasswordContainNumber && "!text-green-500")} as="li">
								Must contain at least one number.
							</Text>
							<Text className={cn("!text-xs !text-primary duration-150", isPasswordContainSpecialCharacter && "!text-green-500")} as="li">
								Must contain at least one special character.
							</Text>
							<Text className={cn("!text-xs !text-primary duration-150", doPasswordsMatch && password && "!text-green-500")} as="li">
								Passwords must match.
							</Text>
						</ul>
						<Input
							onChange={(e) => setPassword(e.target.value)}
							value={password}
							className="animate-appearance-in delay-150"
							name="email"
							placeholder="Password"
						/>
					</Field>
					<Input
						onChange={(e) => setConfirmPassword(e.target.value)}
						value={confirmPassword}
						className="mt-5 animate-appearance-in delay-200"
						name="email"
						placeholder="Confirm Password"
					/>
					<Button
						onClick={() => setStage("USER_WITHOUT_ACCOUNT_EMAIL_VERIFICATION")}
						className="mt-5 w-full"
						type="submit"
						color="primary"
						disabled={!isPasswordValid || !doPasswordsMatch || isLoading}>
						Continue
					</Button>
					<div className="mt-auto flex w-full  animate-appearance-in justify-between rounded-small bg-content2 p-3">
						<p className="text-xs">Entered an incorrect email?</p>
						<Link href="/login" className="text-xs text-primary">
							Start Over
						</Link>
					</div>
				</form>
			)}
			{stage === "NEW_PENDING_USER_EMAIL_PASSWORD" && (
				<form className="flex h-[calc(100%-56px)] flex-col" action={handleStage1}>
					<Text className="mt-5">Create a password.</Text>
					<Field className="mt-5">
						<Label>Password</Label>
						<ul className="mb-3 ml-4 mt-2 list-outside list-disc text-xs">
							<Text className={cn("!text-xs !text-primary duration-150", isPasswordAtLeast8Characters && "!text-green-500")} as="li">
								At least 8 characters long.
							</Text>
							<Text className={cn("!text-xs !text-primary duration-150", isPasswordContainUppercase && "!text-green-500")} as="li">
								Must contain at least one uppercase letter.
							</Text>
							<Text className={cn("!text-xs !text-primary duration-150", isPasswordContainLowercase && "!text-green-500")} as="li">
								Must contain at least one lowercase letter.
							</Text>
							<Text className={cn("!text-xs !text-primary duration-150", isPasswordContainNumber && "!text-green-500")} as="li">
								Must contain at least one number.
							</Text>
							<Text className={cn("!text-xs !text-primary duration-150", isPasswordContainSpecialCharacter && "!text-green-500")} as="li">
								Must contain at least one special character.
							</Text>
							<Text className={cn("!text-xs !text-primary duration-150", doPasswordsMatch && password && "!text-green-500")} as="li">
								Passwords must match.
							</Text>
						</ul>
						<Input
							onChange={(e) => setPassword(e.target.value)}
							value={password}
							className="animate-appearance-in delay-150"
							name="email"
							placeholder="Password"
						/>
					</Field>
					<Input
						onChange={(e) => setConfirmPassword(e.target.value)}
						value={confirmPassword}
						className="mt-5 animate-appearance-in delay-200"
						name="email"
						placeholder="Confirm Password"
					/>
					<Button
						onClick={() => setStage("NEW_PENDING_USER_EMAIL_VERIFICATION")}
						className="mt-5 w-full"
						type="submit"
						color="primary"
						disabled={!isPasswordValid || !doPasswordsMatch || isLoading}>
						Continue
					</Button>
					<div className="mt-auto flex w-full  animate-appearance-in justify-between rounded-small bg-content2 p-3">
						<p className="text-xs">Entered an incorrect email?</p>
						<Link href="/login" className="text-xs text-primary">
							Start Over
						</Link>
					</div>
				</form>
			)}
			{stage === "USER_WITHOUT_ACCOUNT_EMAIL_VERIFICATION" && (
				<form className="flex h-[calc(100%-56px)] flex-col" action={handleStage1}>
					<Field className="mt-8">
						<Label>Verify Your Email</Label>
						<Description>
							We’ve sent a verification email code to your email. Please check your inbox and enter the code below to continue. The code is valid for
							10 minutes. If you haven’t received the email, please check your spam folder or contact us so that we can directly verify your email.
						</Description>
						<OTPInput
							maxLength={6}
							onChange={(val) => setVerificationCode(val)}
							value={verificationCode}
							containerClassName="group mt-3 flex items-center has-[:disabled]:opacity-30"
							render={({ slots }) => (
								<>
									<div className="flex">
										{slots.slice(0, 3).map((slot, idx) => (
											<Slot key={idx} {...slot} />
										))}
									</div>
									<FakeDash />
									<div className="flex">
										{slots.slice(3).map((slot, idx) => (
											<Slot key={idx} {...slot} />
										))}
									</div>
								</>
							)}
						/>
					</Field>
					<Button className="mt-5 w-full" onClick={handleHalfVerifyEmail} color="primary" disabled={isLoading || verificationCode.length !== 6}>
						Continue
					</Button>
					<div className="mt-auto flex w-full  animate-appearance-in justify-between rounded-small bg-content2 p-3">
						<p className="text-xs">Entered an incorrect email?</p>
						<span onClick={() => setStage("START")} className="cursor-pointer text-xs text-primary">
							Start Over
						</span>
					</div>
				</form>
			)}
			{stage === "NO_USER" && (
				<form className="flex h-[calc(100%-56px)] flex-col gap-5" action={handleCreateNewPendingUser}>
					<Field className="mt-5 animate-appearance-in delay-100">
						<Label>
							Official Name <Badge color="red">Required</Badge>
						</Label>
						<Description>
							<span className="text-xs">
								Your name as it appears on your passport. You can change this later in settings. You can also add a preferred name later in account
								settings.
							</span>
						</Description>
						<Input name="officialName" />
					</Field>
					<Field className="animate-appearance-in delay-300">
						<Label>
							Official Surname <Badge color="red">Required</Badge>
						</Label>
						<Description>
							<span className="text-xs">Your surname as it appears on your passport. You can change this later in account settings.</span>
						</Description>
						<Input className="mt-5" name="officialSurname" />
					</Field>
					<Field className="animate-appearance-in delay-500">
						<Label>
							School <Badge color="yellow">Optional</Badge>
						</Label>
						<Description>
							<span className="text-xs">
								You need to have a school selected to be able to attend the conference. You can change this later in settings.
							</span>
						</Description>
						<Select defaultValue="null" className="mt-5 animate-appearance-in" name="schoolId">
							<option value="null">None</option>
							{schools.map((school) => (
								<option key={school.id} value={school.id}>
									{school.name}
								</option>
							))}
						</Select>
					</Field>
					<Button className="mt-5 w-full animate-appearance-in delay-700" type="submit" color="primary" disabled={isLoading}>
						Continue
					</Button>
					<div className="mt-auto flex w-full animate-appearance-in  justify-between rounded-small bg-content2 p-3 delay-1000">
						<p className="text-xs">Entered an incorrect email?</p>
						<span onClick={() => setStage("START")} className="text-xs text-primary">
							Start Over
						</span>
					</div>
				</form>
			)}

			{stage === "NEW_PENDING_USER_EMAIL_VERIFICATION" && (
				<form className="flex h-[calc(100%-56px)] flex-col">
					<Field className="mt-8">
						<Label>Verify Your Email</Label>
						<Description>
							We’ve sent a verification email code to {email}. Please check your inbox and enter the code below to continue. The code is valid for 10
							minutes. If you haven’t received the email, please check your spam folder or contact us so that we can directly verify your email.
						</Description>
						<OTPInput
							maxLength={6}
							onChange={(val) => setVerificationCode(val)}
							value={verificationCode}
							containerClassName="group mt-3 flex items-center has-[:disabled]:opacity-30"
							render={({ slots }) => (
								<>
									<div className="flex">
										{slots.slice(0, 3).map((slot, idx) => (
											<Slot key={idx} {...slot} />
										))}
									</div>
									<FakeDash />
									<div className="flex">
										{slots.slice(3).map((slot, idx) => (
											<Slot key={idx} {...slot} />
										))}
									</div>
								</>
							)}
						/>
					</Field>
					<Button className="mt-5 w-full" onClick={handleCreateNewUser} color="primary" disabled={isLoading || verificationCode.length !== 6}>
						Continue
					</Button>
					<div className="mt-auto flex w-full  animate-appearance-in justify-between rounded-small bg-content2 p-3">
						<p className="text-xs">Entered an incorrect email?</p>
						<span onClick={() => setStage("START")} className="cursor-pointer text-xs text-primary">
							Start Over
						</span>
					</div>
				</form>
			)}
			{stage === "NEW_ACCOUNT_CREATED" && (
				<div className="flex h-[calc(100%-56px)] flex-col">
					{width && height && <Confetti width={width} height={height} />}
					<Text className="mt-5">Your account has been created successfully.</Text>
					<div className="mt-8 space-y-8">
						<Text>
							You can now login to MediBook using your Email or User ID and Password. If you have any questions or need help,{" "}
							<TextLink href="/contact">contact us</TextLink>.
						</Text>
						<Button className="w-full" href="/login" color="primary">
							Log In
						</Button>
					</div>
				</div>
			)}
			{stage === "HALF_ACCOUNT_CREATED" && (
				<div className="flex h-[calc(100%-56px)] flex-col">
					{width && height && <Confetti width={width} height={height} />}
					<Text className="mt-5">Your account has been created successfully.</Text>
					<div className="mt-8 space-y-8">
						<Text>
							You can now login to MediBook using your Email or User ID and Password. If you have any questions or need help,{" "}
							<TextLink href="/contact">contact us</TextLink>.
						</Text>
						<Button className="w-full" href="/login" color="primary">
							Log In
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
