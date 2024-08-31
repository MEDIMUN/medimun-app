"use client";

import { useState } from "react";
import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Link } from "@nextui-org/link";
import { checkEmail, signUp, createUser } from "./signup.server";
import { cn } from "@/lib/cn";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { countries } from "@/data/countries.js";
import { useWindowDimensions } from "@/hooks/use-window-dimensions";
import Confetti from "react-confetti";
import { nameCase } from "@/lib/text";

export default function SignUp() {
	//STATES

	const [modalOpacity, setModalOpacity] = useState(100);
	const [modalWidth, setModalWidth] = useState(50);
	const [emailCodeInput, setEmailCodeInput] = useState("");
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState("");
	const [currentPage, setCurrentPage] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [user, setUser] = useState({});
	const [officialNameInput, setOfficialNameInput] = useState("");
	const [officialSurnameInput, setOfficialSurnameInput] = useState("");
	const [officialEmailInput, setOfficialEmailInput] = useState("");
	const [dateOfBirthInput, setDateOfBirthInput] = useState("");
	const [country, setCountry] = useState("");
	const [primaryPasswordInput, setPrimaryPasswordInput] = useState("");
	const [seconparyPasswordInput, setSeconparyPasswordInput] = useState("");

	//CONSTANTS

	const pageDetails = [
		{
			title: "Create an Account",
			description: "To access MediBook and attend the conference, a MEDIMUN account is necessary.",
		},
		{
			title: "Email",
			description:
				"Please enter your email address. We recommend using your school email. If we have records of your past participation you may be unable to create an account. This will be fixed in the future. For now you can contact us to get registered in that case.",
		},
		{
			title: "Official Name & Surname",
			description: "Please enter your official name as it appears on your passport.",
		},
		{
			title: "Date of Birth",
			description: "Please enter your date of birth as it appears on your passport.",
		},
		{
			title: "Nationality",
			description: "Please enter your country of citizenship.",
		},
		{
			title: "Password",
			description: "Please set a password.",
		},
		{
			title: "Verify Your Email",
			description: `We've sent a code to ${
				user?.email || "your email address"
			}. Please enter it below to verify your email address. It may take a few minutes for the email to arrive.`,
		},
		{
			title: "Congratulations!",
			description: "Your account has been created. You can now log in to your account and access the conference.",
		},
	];

	const checklistClass = "flex flex-row items-center text-center text-sm text-black w-full h-1/5 p-2 bg-gray-100 rounded-sm duration-500";

	//HOOKS

	const router = useRouter();
	const searchParams = useSearchParams();
	const { width, height } = useWindowDimensions();
	const { toast } = useToast();

	//BUTTONS

	function NextButton() {
		return (
			<div className="flex flex-col gap-2">
				<Button disabled={isLoading} className="my-3 bg-primary">
					{isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
					CONTINUE
				</Button>
			</div>
		);
	}

	function BackButton() {
		return (
			<div className="flex flex-col gap-2">
				<Button disabled={isLoading} onClick={() => setCurrentPage(currentPage - 1)} className="mx-auto h-6 w-36 rounded-3xl ">
					{isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}← BACK
				</Button>
			</div>
		);
	}

	//FUNCTIONS

	async function nextPage(event) {
		event.preventDefault();
		setIsLoading(true);
		switch (currentPage) {
			case 0:
				setCurrentPage(currentPage + 1);
				setIsLoading(false);
				break;

			case 1:
				const emailExists = await checkEmail(officialEmailInput);
				if (officialEmailInput == "" || !/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/.test(officialEmailInput) || emailExists.exists) {
					if (!emailExists.exists) {
						toast({
							title: "Email address is empty or Invalid",
							description: "Please enter a proper email address.",
							variant: "destructive",
						});
					} else {
						toast({
							title: "Email alredy exists.",
							description: "Please use a different email address or try again later.",
							variant: "destructive",
						});
						await new Promise((r) => setTimeout(r, 1000));
						router.replace("/login?email=" + officialEmailInput);
					}
				} else {
					setUser({ email: officialEmailInput });
					setCurrentPage(currentPage + 1);
					setModalWidth(100);
					setModalOpacity(90);
					setIsLoading(false);
				}
				setIsLoading(false);
				break;

			case 2:
				if (officialNameInput == "" || officialSurnameInput == "") {
					toast({
						title: "Invalid input",
						description: "Please enter a valid name.",
						variant: "destructive",
					});
				} else {
					setUser({ ...user, officialName: officialNameInput, officialSurname: officialSurnameInput });
					setCurrentPage(currentPage + 1);
				}
				setIsLoading(false);
				break;

			case 3:
				if (dateOfBirthInput) {
					setUser({ ...user, dateOfBirth: new Date(dateOfBirthInput) });
					setCurrentPage(currentPage + 1);
				} else {
					toast({
						title: "Invalid input",
						description: "Please enter a valid date of birth.",
						variant: "destructive",
					});
				}
				setIsLoading(false);
				break;

			case 4:
				if (country) {
					setUser({ ...user, nationality: country });
					setCurrentPage(currentPage + 1);
				} else {
					toast({
						title: "Invalid input",
						description: "Please enter a valid country.",
						variant: "destructive",
					});
				}
				setIsLoading(false);
				break;

			case 5:
				if (
					/[A-Z]/.test(primaryPasswordInput) &&
					/[a-z]/.test(primaryPasswordInput) &&
					/[0-9]/.test(primaryPasswordInput) &&
					/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(primaryPasswordInput) &&
					primaryPasswordInput.length > 7 &&
					primaryPasswordInput === seconparyPasswordInput &&
					primaryPasswordInput
				) {
					let response;
					try {
						response = await signUp({ ...user, password: primaryPasswordInput });
					} catch (error) {
						toast({
							title: res.error,
							description: "Please try again later.",
							variant: "destructive",
						});
					}
					if (response && response.ok) {
						setCurrentPage(currentPage + 1);
					} else {
						toast({
							title: "Please try again later",
							variant: "destructive",
						});
					}
				} else {
					toast({
						title: "Invalid Password",
						description: "Please fullfill all password requirements.",
						variant: "destructive",
					});
				}
				setIsLoading(false);
				break;

			case 6:
				let response;
				try {
					response = await createUser(user.email, emailCodeInput);
				} catch (error) {
					toast({
						title: "Please try again later",
						description: "An unknown error occured.",
						variant: "destructive",
					});
				}
				if (response && response.ok) {
					setCurrentPage(currentPage + 1);
					setModalOpacity(30);
				} else {
					toast({
						title: "Invalid Code",
						description: "Please enter a valid code.",
						variant: "destructive",
					});
				}
				setIsLoading(false);
				break;
		}
	}

	function Title() {
		return (
			<div className="mb-5 flex flex-col space-y-2 text-center">
				<div className="mx-auto flex flex-row">
					<h1 className="p-3 text-2xl font-semibold tracking-tight">{pageDetails[currentPage].title}</h1>
				</div>
				<p className="text-sm duration-500 md:text-muted-foreground">{pageDetails[currentPage].description} </p>
			</div>
		);
	}

	return (
		<div
			className={`flex h-full w-full justify-center bg-white bg-opacity-80 align-middle duration-1000 md:w-[${modalWidth}%] md:bg-opacity-${modalOpacity}`}>
			<div className="py-auto flex h-[100%] w-[350px] flex-col justify-center px-[10px] align-middle">
				<Title />
				{currentPage == 0 && (
					<>
						<div className="flex flex-col gap-2">
							<Button onClick={nextPage} disabled={true || isLoading} className="my-3 bg-primary">
								{isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
								CURRENTLY UNAVAILABLE{" "}
								{
									//START
								}
							</Button>
						</div>
						<Divider />
						<div className="mt-3 flex flex-row gap-2">
							<Button disabled={isLoading} onClick={() => router.push("/login")} className="w-full" href="/loginhelp">
								LOG IN
							</Button>
						</div>
						<FinePrint />
					</>
				)}
				{currentPage == 1 && (
					<form onSubmit={nextPage}>
						<Label className="sr-only text-center" htmlFor="email">
							Email{officialEmailInput}
						</Label>
						<Input
							value={officialEmailInput}
							onChange={(e) => {
								setOfficialEmailInput(e.target.value.toLowerCase());
							}}
							className="text-center text-lg md:text-sm"
							name="email"
							placeholder="Enter Your Email"
							type="email"
							autoCapitalize="none"
							autoCorrect="off"
						/>
						<NextButton />
					</form>
				)}
				{currentPage == 2 && (
					<form onSubmit={nextPage}>
						<div className="flex flex-col gap-1">
							<Label className="sr-only text-center" htmlFor="officialName">
								Official Name
							</Label>
							<Input
								value={officialNameInput}
								onChange={(e) => {
									setOfficialNameInput(nameCase(e.target.value));
								}}
								className="text-center text-lg md:text-sm"
								id="officialName"
								name="officialName"
								placeholder="Official Name"
								type="text"
								autoCapitalize="none"
								autoCorrect="off"
							/>
							<Label className="sr-only text-center" htmlFor="officialSurname">
								Official Surname
							</Label>
							<Input
								value={officialSurnameInput}
								onChange={(e) => {
									setOfficialSurnameInput(nameCase(e.target.value));
								}}
								className="text-center text-lg md:text-sm"
								id="officialSurname"
								name="officialSurname"
								placeholder="Official Surname"
								type="text"
								autoCapitalize="none"
								autoCorrect="off"
							/>
						</div>
						<NextButton />
					</form>
				)}
				{currentPage == 3 && (
					<>
						<form onSubmit={nextPage}>
							<Label className="sr-only text-center" htmlFor="dateOfBirth">
								Date Of Birth
							</Label>
							<Input
								value={dateOfBirthInput}
								onChange={(e) => {
									setDateOfBirthInput(e.target.value);
								}}
								className="text-center text-lg md:text-sm"
								id="dateOfBirth"
								name="dateOfBirth"
								placeholder="Enter Your Date of Birth"
								type="date"
							/>
							<NextButton />
						</form>
						<BackButton />
					</>
				)}
				{currentPage == 4 && (
					<>
						<form onSubmit={nextPage}>
							<div className="flex flex-col">
								<Popover className="w-full" open={open} onOpenChange={setOpen}>
									<PopoverTrigger asChild>
										<Button variant="outline" role="combobox" aria-expanded={open} className="justify-between uppercase">
											{value ? countries.find((country) => country.countryCode === value)?.countryNameEn : "Select Country..."}
											{value}
											<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-full p-0">
										<Command>
											<CommandInput placeholder="Search country..." />
											<CommandEmpty>No country found.</CommandEmpty>
											<CommandGroup className="max-h-[300px] w-[330px] overflow-auto">
												{countries.map((country) => (
													<CommandItem
														key={country.countryCode}
														onSelect={(currentValue) => {
															setValue(currentValue === value ? "" : currentValue);
															setCountry(country.countryCode);
															setOpen(false);
														}}>
														<Check className={cn("mr-2 h-4 w-4", value === country.countryCode ? "opacity-100" : "opacity-0")} />
														{country.flag + " " + country.countryNameEn + `${country.countryCode == "CY" ? " (Both Sides)" : ""}`}
													</CommandItem>
												))}
											</CommandGroup>
										</Command>
									</PopoverContent>
								</Popover>
								<NextButton />
							</div>
						</form>
						<BackButton />
					</>
				)}
				{currentPage == 5 && (
					<>
						<form onSubmit={nextPage}>
							<div className="flex flex-col gap-1">
								<Label className="sr-only text-center" htmlFor="primaryPassword">
									Password
								</Label>
								<Input
									value={primaryPasswordInput}
									onChange={(e) => {
										setPrimaryPasswordInput(e.target.value);
									}}
									className="text-center text-lg md:text-sm"
									id="primaryPassword"
									name="primaryPassword"
									placeholder="Password"
									type="password"
									autoCapitalize="none"
									autoCorrect="off"
								/>
								<Label className="sr-only text-center" htmlFor="secondaryPassword">
									Type Password Again
								</Label>
								<Input
									value={seconparyPasswordInput}
									onChange={(e) => {
										setSeconparyPasswordInput(e.target.value);
									}}
									className="text-center text-lg md:text-sm"
									id="secondaryPassword"
									name="secondaryPassword"
									placeholder="Type Password Again"
									type="password"
									autoCapitalize="none"
									autoCorrect="off"
								/>
								<div className="flex h-min w-full flex-col gap-2 rounded-md border-[1px] border-gray-200 bg-white p-2 text-center">
									<div className={checklistClass + " " + `${/[A-Z]/.test(primaryPasswordInput) && "bg-green-500"}`}>At least one capital letter</div>
									<div className={checklistClass + " " + `${/[a-z]/.test(primaryPasswordInput) && "bg-green-500"}`}>
										At least one lowercase letter
									</div>
									<div className={checklistClass + " " + `${/[0-9]/.test(primaryPasswordInput) && "bg-green-500"}`}>At least one number</div>
									<div className={checklistClass + " " + `${/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(primaryPasswordInput) && "bg-green-500"}`}>
										At least one special character
									</div>
									<div className={checklistClass + " " + `${primaryPasswordInput.length > 7 && "bg-green-500"}`}>At least 8 characters long</div>
									<div
										className={
											checklistClass + " " + `${primaryPasswordInput === seconparyPasswordInput && primaryPasswordInput !== "" && "bg-green-500"}`
										}>
										Passwords must match
									</div>
								</div>
							</div>
							<NextButton />
						</form>
						<BackButton />
					</>
				)}
				{currentPage == 6 && (
					<form onSubmit={nextPage}>
						<Input
							value={emailCodeInput}
							onChange={(e) => {
								setEmailCodeInput(
									e.target.value
										.trim()
										.substring(0, 6)
										.replace(/[^0-9]/g, "")
								);
							}}
							className="text-center text-lg md:text-sm"
							placeholder="Enter Your Email Code"
							id="emailCode"
							name="emailCode"
							type="number"
						/>
						<NextButton />
					</form>
				)}
				{currentPage == 7 && (
					<>
						<Confetti width={width} height={height} />
						<div className="mt-3 flex flex-row gap-2">
							<Button type="button" disabled={isLoading} onClick={() => router.push("/login")} className="w-full" href="/loginhelp">
								LOG IN
							</Button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

function Divider() {
	return (
		<div className="relative">
			<div className="absolute inset-0 flex items-center">
				<span className="w-full border-t" />
			</div>
			<div className="relative flex justify-center text-xs uppercase">
				<span className="rounded-lg bg-background px-2 text-muted-foreground">ALREDY HAVE AN ACCOUNT?</span>
			</div>
		</div>
	);
}

function FinePrint() {
	return (
		<p className="my-3 text-center text-sm text-muted-foreground">
			By clicking start, you agree to our
			<br />
			<Link href="/terms" className="underline underline-offset-4 hover:text-primary">
				Terms of Service
			</Link>{" "}
			and{" "}
			<Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
				Privacy Policy
			</Link>
			.
		</p>
	);
}
