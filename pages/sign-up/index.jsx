import { useState, useRef } from "react";
import Router from "next/router";
import prisma from "../../client";

import style from "../../styles/sign-up.module.css";

import { Button, Loading, Spacer, Input } from "@nextui-org/react";
import Pagelayout from "../../components/page/layout/layout";
import SignUpModal from "../../components/page/pages/sign-up/sign-up-modal";

/** @param {import('next').InferGetStaticPropsType<typeof getStaticProps> } props */
export default function SignUpPage(props) {
	const official_name_ref = useRef();
	const official_surname_ref = useRef();
	const display_name_ref = useRef();
	const display_surname_ref = useRef();
	const email_ref = useRef();
	const confirm_email_ref = useRef(null);
	const date_of_birth_ref = useRef();
	const password_ref = useRef();
	const confirm_password_ref = useRef();

	const [official_name_state, set_official_name_state] = useState("");
	const [official_surname_state, set_official_surname_state] = useState("");
	const [display_name_state, set_display_name_state] = useState("");
	const [display_surname_state, set_display_surname_state] = useState("");
	const [email_state, set_email_state] = useState("");
	const [confirm_email_state, set_confirm_email_state] = useState("");
	const [date_of_birth_state, set_date_of_birth_state] = useState("");
	const [password_state, set_password_state] = useState("");
	const [confirm_password_state, set_confirm_password_state] = useState("");
	const [res_email, set_res_email] = useState("your email");

	const [currentPage, setCurrentPage] = useState(1);
	const [proceed, setProceed] = useState(true);

	const [check1, setCheck1] = useState(false);
	const [check2, setCheck2] = useState(false);
	const [check3, setCheck3] = useState(false);
	const [check4, setCheck4] = useState(false);
	const [check5, setCheck5] = useState(false);
	const [check6, setCheck6] = useState(false);
	const [check7, setCheck7] = useState(false);

	const [buttonText, setButtonText] = useState("Agree & Proceed");
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	const [isButtonVisible, setIsButtonVisible] = useState(true);

	async function handleProceed() {
		const request = await fetch("/api/account/create", {
			method: "POST",
			body: JSON.stringify({
				official_name: official_name_state,
				official_surname: official_surname_state,
				display_name: display_name_state,
				display_surname: display_surname_state,
				email: email_state,
				dob: date_of_birth_state,
				password: password_ref.current.value,
				confirm_password: confirm_password_ref.current.value,
			}),
		})
			.then((res) => {
				if (res.status !== 201) {
					throw new Error("Something went wrong!");
				}
				return res.json();
			})
			.then((data) => {
				console.log(data);
				if (!data) {
					return;
				}
				setCurrentPage(8);
				setButtonText("Invisible");
				set_res_email(data.email);
			});
	}

	let pageName = [
		"Terms and Conditions",
		"Before you begin",
		"Personal Details",
		"Personal Details",
		"Personal Details",
		"Personal Details",
		"Personal Details",
		"Create Your Password",
		"Email Verification",
		"Welcome to MEDIMUN",
	];

	async function nextPage() {
		// Terms and Conditions
		if (currentPage === 1) {
			setCurrentPage(2);
			setButtonText("Lets Begin!");
		}
		// Before you begin
		if (currentPage === 2) {
			setCurrentPage(3);
			setIsButtonDisabled(true);
			setButtonText("Next");
		}
		// Email
		if (currentPage === 3) {
			set_email_state(email_ref.current.value);
			set_confirm_email_state(confirm_email_ref.current.value);
			setCurrentPage(4);
			setIsButtonDisabled(true);
			setButtonText("Next");
		}
		// Official name
		if (currentPage === 4) {
			set_official_name_state(official_name_ref.current.value);
			set_official_surname_state(official_surname_ref.current.value);
			setCurrentPage(5);
			setIsButtonDisabled(false);
			setButtonText("Next");
		}
		// Display name
		if (currentPage === 5) {
			set_display_name_state(display_name_ref.current.value);
			set_display_surname_state(display_surname_ref.current.value);
			setCurrentPage(6);
			setIsButtonDisabled(true);
			setButtonText("Next");
		}
		//Date of Birth
		if (currentPage === 6) {
			set_date_of_birth_state(date_of_birth_ref.current.value);
			setCurrentPage(7);
			setIsButtonDisabled(true);
			setButtonText("Create Account");
		}
		//Password
		if (currentPage === 7) {
			setIsButtonDisabled(true);
			setButtonText("Loading");
			await new Promise((r) => setTimeout(r, 2000));
			handleProceed();
		}
	}

	async function CheckEmailInputs() {
		const emailInput = email_ref.current.value.toLowerCase();
		const confirmEmailInput = confirm_email_ref.current.value.toLowerCase();
		let check4normal = false;
		setCheck1(false);
		setCheck2(false);
		setCheck3(false);
		setCheck4(false);
		if (emailInput) {
			setCheck1(true);
		}
		if (emailInput.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i)) {
			setCheck2(true);
		}
		if (confirmEmailInput) {
			setCheck3(true);
		}
		if (emailInput == confirmEmailInput) {
			check4normal = true;
		}
		if (check1 && check2 && check3 && check4normal) {
			setIsButtonDisabled(false);
			setCheck4(check4normal);
		} else {
			setIsButtonDisabled(true);
			setCheck4(check4normal);
		}
	}

	async function CheckOfficialNameInputs() {
		const officialNameInput = official_name_ref.current.value;
		const officialSurnameInput = official_surname_ref.current.value;
		setCheck1(false);
		setCheck2(false);
		if (officialNameInput) {
			setCheck1(true);
		}
		if (officialSurnameInput) {
			setCheck2(true);
		}
		if (check1 && check2) {
			setIsButtonDisabled(false);
		} else {
			setIsButtonDisabled(true);
		}
	}

	async function CheckDisplayNameInputs() {}

	async function CheckDateOfBirthInputs() {
		const dateOfBirthInput = date_of_birth_ref.current.value;
		let check1normal = false;
		if (dateOfBirthInput) {
			check1normal = true;
		} else {
			check1normal = false;
		}

		if (check1normal) {
			setIsButtonDisabled(false);
			setCheck1(check1normal);
		} else {
			setIsButtonDisabled(true);
			setCheck1(check1normal);
		}
	}

	async function CheckPasswordInput() {
		const passwordInput = password_ref.current.value;
		const confirmPasswordInput = confirm_password_ref.current.value;
		let check1normal = false;
		let check2normal = false;
		let check3normal = false;
		let check4normal = false;
		let check5normal = false;
		let check6normal = false;
		let check7normal = false;
		let check8normal = false;
		if (passwordInput) {
			check1normal = true;
		}

		if (passwordInput.match(/[a-z]/)) {
			check2normal = true;
		}

		if (passwordInput.match(/[A-Z]/)) {
			check3normal = true;
		}

		if (passwordInput.match(/[0-9]/)) {
			check4normal = true;
		}

		if (passwordInput.length >= 8) {
			check5normal = true;
		}

		if (passwordInput.length <= 20) {
			check6normal = true;
		}

		if (passwordInput == confirmPasswordInput) {
			check7normal = true;
		}

		if (check1normal && check2normal && check3normal && check4normal && check5normal && check6normal && check7normal) {
			setIsButtonDisabled(false);
			setCheck1(check1normal);
			setCheck2(check2normal);
			setCheck3(check3normal);
			setCheck4(check4normal);
			setCheck5(check5normal);
			setCheck6(check6normal);
			setCheck7(check7normal);
		} else {
			setIsButtonDisabled(true);
			setCheck1(check1normal);
			setCheck2(check2normal);
			setCheck3(check3normal);
			setCheck4(check4normal);
			setCheck5(check5normal);
			setCheck6(check6normal);
			setCheck7(check7normal);
		}
	}

	return (
		<Pagelayout>
			<div className={style.backgroundImage}>
				<div className={style.container}>
					<SignUpModal title={pageName[currentPage - 1]}>
						{currentPage === 1 ? (
							<div>
								<ul className={style.scrollBox}>
									{props.terms.map((term) => {
										return (
											<li
												className={style.tcitem}
												key={term.id}>
												<p>
													<strong>{term.name} </strong>
													<hr className={style.tcdivider} />
													{term.text} <Spacer y={2} />
												</p>
											</li>
										);
									})}
								</ul>
							</div>
						) : null}
						{/* N







O */}
						{currentPage === 2 ? <div>This is a test build. If you complete the sign up form your application will be received but will not be processed until the app goes public. There are issues and incomplete parts of the site. Thanks for your understanding.</div> : null}
						{/* N







O */}
						{currentPage === 3 ? (
							<div className={style.centered}>
								<Spacer y={1} />
								<div className={style.title}>
									<h3>Email</h3>
									<h5>Your email will be used as your username</h5>
									<h5>We recommend that you use your school email</h5>
								</div>
								<Spacer y={2} />
								<Input
									size="lg"
									ref={email_ref}
									width="90%"
									color="secondary"
									underlined
									labelPlaceholder={"Email"}
									onInput={CheckEmailInputs}
								/>
								<Spacer y={2} />
								<Input
									ref={confirm_email_ref}
									width="90%"
									color="secondary"
									size="lg"
									underlined
									labelPlaceholder={"Confirm Email"}
									onInput={CheckEmailInputs}
								/>
								<Spacer y={2} />
								<div className={style.title}>
									{!check1 ? <h5 className={style.validation}>Email is required</h5> : null}
									{!check2 && email_ref.current ? <h5 className={style.validation}>Invalid email</h5> : null}
									{!check3 && email_ref.current ? <h5 className={style.validation}>Confirm email field is required</h5> : null}
									{!check4 && confirm_email_ref.current ? <h5 className={style.validation}>Emails do not match</h5> : null}
								</div>
							</div>
						) : null}
						{/* N







O */}
						{currentPage === 4 ? (
							<div className={style.centered}>
								<Spacer y={1} />
								<div className={style.title}>
									<h3>Official Name</h3>
									<h6>The official name must match the name on your passport</h6>
									<h6>
										The official name will only be used on official documents. You can optionally declare a display name on the next stage to be used on your
										nametag
									</h6>
									<h6>You can change your official name later in the app</h6>
								</div>
								<Spacer y={2} />
								<Input
									ref={official_name_ref}
									width="90%"
									color="secondary"
									size="lg"
									underlined
									labelPlaceholder="Official Name"
									onInput={CheckOfficialNameInputs}
								/>
								<Spacer y={2} />
								<Input
									ref={official_surname_ref}
									width="90%"
									color="secondary"
									size="lg"
									underlined
									labelPlaceholder="Official Surname"
									onInput={CheckOfficialNameInputs}
								/>
								<Spacer y={2} />
								<div className={style.title}>
									{!check1 ? <h5 className={style.validation}>Official Name is required</h5> : null}
									{!check2 ? <h5 className={style.validation}>Official Surname is required</h5> : null}
								</div>
							</div>
						) : null}
						{/* N







O */}
						{currentPage === 5 ? (
							<div className={style.centered}>
								<Spacer y={1} />
								<div className={style.title}>
									<h3>
										Display Name <span className={style.optional}>Optional</span>
									</h3>
									<h6>The Display resemble your official name</h6>
									<h6>The display name will be used on your nametag</h6>
									<h6>You can change your display name later in the app</h6>
								</div>
								<Spacer y={2} />
								<Input
									ref={display_name_ref}
									width="90%"
									color="secondary"
									size="lg"
									underlined
									labelPlaceholder="Display Name"
									//	onInput={CheckDisplayNameInputs}
								/>
								<Spacer y={2} />
								<Input
									size="lg"
									ref={display_surname_ref}
									width="90%"
									color="secondary"
									underlined
									labelPlaceholder="Display Surname"
									//		onInput={CheckDisplayNameInputs}
								/>
								<Spacer y={2} />
							</div>
						) : null}
						{/* N







O */}
						{currentPage === 6 ? (
							<div className={style.centered}>
								<Spacer y={1} />
								<div className={style.title}>
									<h3>Date Of Birth</h3>
									<h6>The date of birth must match the date of birth on your passport</h6>
								</div>
								<Spacer y={2} />
								<Input
									size="lg"
									ref={date_of_birth_ref}
									color="secondary"
									type="date"
									width="90%"
									underlined
									label="Date of Birth"
									onInput={CheckDateOfBirthInputs}
								/>
							</div>
						) : null}
						{/* N







O */}
						{currentPage === 7 ? (
							<div className={style.centered}>
								<Spacer y={1} />
								<div className={style.title}>
									<h3>Create Password</h3>
									<h6>
										The password must be at least 8 characters long, must have;
										<br />
										one lowercase letter,
										<br />
										one capital letter,
										<br />
										and one number
									</h6>
								</div>
								<Spacer y={2} />
								<Input
									size="lg"
									ref={password_ref}
									width="90%"
									color="secondary"
									type="password"
									labelPlaceholder="Password"
									onInput={CheckPasswordInput}
									underlined
								/>
								<Spacer y={2} />
								<Input
									size="lg"
									ref={confirm_password_ref}
									width="90%"
									color="secondary"
									type="password"
									labelPlaceholder="Confirm Password"
									onInput={CheckPasswordInput}
									underlined
								/>
								<div className={style.title}>
									{!check1 ? <h5 className={style.validation}>Password is required</h5> : null}
									{!check2 ? <h5 className={style.validation}>Password must have lowercase letters</h5> : null}
									{!check3 ? <h5 className={style.validation}>Password must have capital letters</h5> : null}
									{!check4 ? <h5 className={style.validation}>Password must have numbers</h5> : null}
									{!check5 ? <h5 className={style.validation}>Password must be at least 8 characters long</h5> : null}
									{!check6 ? <h5 className={style.validation}>Passwords must not be longer than 64 characters</h5> : null}
									{!check7 ? <h5 className={style.validation}>Two passwords must match</h5> : null}
								</div>
							</div>
						) : null}
						{/* N







O */}
						{currentPage === 8 ? (
							<div className={style.centered}>
								<h2 className={style.evititle}>
									We<span>&apos;</span>ve sent an email to {res_email || "you"}.
								</h2>
								<Spacer y={2} />
								<div>
									<div className={style.PAVmessage}>
										<h6>
											If you don<span>&apos;</span>t have access to your email please ask a member of staff to verify your account. You may be asked to proove
											your identity.
										</h6>
									</div>
								</div>
							</div>
						) : null}
						{/* N







O */}

						{/* N







O */}
					</SignUpModal>
					{buttonText !== "Invisible" ? (
						<div className={style.buttons}>
							<Button
								color="primary"
								disabled={isButtonDisabled}
								onPress={nextPage}
								bordered
								auto>
								{buttonText === "Loading" ? <Loading /> : buttonText}
							</Button>
						</div>
					) : null}
				</div>
			</div>
		</Pagelayout>
	);
}

export async function getStaticProps() {
	try {
		return {
			props: {
				terms: await prisma.termsAndConditions.findMany(),
			},
			revalidate: 450,
		};
	} catch (e) {
		return {
			notFound: true,
		};
	}
}
