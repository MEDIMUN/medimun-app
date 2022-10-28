import style from "../styles/sign-up.module.css";
import { useState, useRef } from "react";
import SignUpModal from "../components/modals/sign-up-modal";

import { Button, Loading, Spacer, Input } from "@nextui-org/react";
import Pagelayout from "../components/layouts/page-layout";
import { PrismaClient } from "@prisma/client";
import Router from "next/router";

const prisma = new PrismaClient();

let pageNumber = 0;

export default function SignupPage(props) {
	const [page, setPage] = useState("Terms and Conditions");
	const [proceed, setProceed] = useState(false);
	const [loading, setLoading] = useState(false);
	const [passwordissue, setPasswordIssue] = useState("");
	const [evi, setEvi] = useState("");
	const [email, setEmail] = useState("");
	const [pageNumberState, setPageNumberState] = useState(0);

	const verification_code_ref = useRef(null);

	const official_name_ref = useRef();
	const official_surname_ref = useRef();
	const display_name_ref = useRef();
	const display_surname_ref = useRef();
	const email_ref = useRef();
	const confirm_email_ref = useRef();
	const date_of_birth_ref = useRef();
	const password_ref = useRef();
	const confirm_password_ref = useRef();

	function PostInfo() {
		fetch("/api/user/pending", {
			method: "POST",
			body: JSON.stringify({
				official_name: official_name_ref.current.value,
				official_surname: official_surname_ref.current.value,
				display_name: display_name_ref.current.value,
				display_surname: display_surname_ref.current.value,
				email: email_ref.current.value,
				dob: date_of_birth_ref.current.value,
				password: password_ref.current.value,
				confirm_password: confirm_password_ref.current.value,
			}),
		})
			.then((response) => {
				if (response.status !== 201) {
					setLoading(false);
					setProceed(true);
					return;
				}
				return response.json();
			})
			.then((data) => {
				if (!data) {
					return;
				}
				setEmail(data.email);
				setEvi(data.code);
				nextPage();
			});
	}

	function nextPage() {
		setLoading(false);
		setProceed(true);
		setPage(pages[2]);
		setProceed(false);
		setPageNumberState(2);
	}

	let pages = ["Terms and Conditions", "Personal Details", "Email Verification", "Welcome to MEDIMUN"];

	function CheckVerifyInput() {
		if (verification_code_ref.current.value.length !== 6) {
			setProceed(false);
		} else {
			setProceed(true);
		}
	}

	function CheckInputs() {
		if (pageNumber === 1) {
			let check1;
			let check2;
			let check3;
			let check4;
			let check5;
			let check6;
			let check7;
			let check8;

			if (!official_name_ref.current.value) {
				check1 = false;
			} else {
				check1 = true;
			}

			if (!official_surname_ref.current.value) {
				check2 = false;
			} else {
				check2 = true;
			}

			if (!email_ref.current.value) {
				check3 = false;
			} else {
				check3 = true;
			}

			if (!confirm_email_ref.current.value) {
				check4 = false;
			} else {
				check4 = true;
			}

			if (!date_of_birth_ref.current.value) {
				check5 = false;
			} else {
				check5 = true;
			}

			if (email_ref.current.value !== confirm_email_ref.current.value) {
				check6 = false;
			} else {
				check6 = true;
			}

			if (
				!password_ref.current.value ||
				password_ref.current.value.length < 8 ||
				password_ref.current.value.length > 64 ||
				password_ref.current.value.includes(" ") ||
				password_ref.current.value !== confirm_password_ref.current.value ||
				!password_ref.current.value.match(/[a-z]/) ||
				!password_ref.current.value.match(/[A-Z]/) ||
				!password_ref.current.value.match(/[0-9]/)
			) {
				check8 = false;
			} else {
				check8 = true;
			}

			let passwordProblem1;
			let passwordProblem2;
			let passwordProblem3;
			let passwordProblem4;
			let passwordProblem5;
			let passwordProblem6;

			if (password_ref.current.value && (password_ref.current.value.length < 8 || password_ref.current.value.length > 64)) {
				passwordProblem1 = "Password must be between 8 and 64 characters long. ";
			} else {
				passwordProblem1 = "";
			}

			if (password_ref.current.value && password_ref.current.value.includes(" ")) {
				passwordProblem2 = "Password cannot contain spaces. ";
			} else {
				passwordProblem2 = "";
			}

			if (password_ref.current.value && !password_ref.current.value.match(/[a-z]/)) {
				passwordProblem3 = "Password must contain at least one lowercase letter. ";
			} else {
				passwordProblem3 = "";
			}

			if (password_ref.current.value && !password_ref.current.value.match(/[A-Z]/)) {
				passwordProblem4 = "Password must contain at least one uppercase letter. ";
			} else {
				passwordProblem4 = "";
			}

			if (password_ref.current.value && !password_ref.current.value.match(/[0-9]/)) {
				passwordProblem5 = "Password must contain at least one number. ";
			} else {
				passwordProblem5 = "";
			}

			if (password_ref.current.value !== confirm_password_ref.current.value) {
				passwordProblem6 = "Passwords do not match. ";
			} else {
				passwordProblem6 = "";
			}

			setPasswordIssue(passwordProblem1 + passwordProblem2 + passwordProblem3 + passwordProblem4 + passwordProblem5 + passwordProblem6);

			const validateEmail = (value) => {
				if (!value) return false;
				return value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);
			};

			if (validateEmail(email_ref.current.value)) {
				check7 = true;
			} else {
				check7 = false;
			}

			if (check1 && check2 && check3 && check4 && check5 && check6 && check7 && check8) {
				setProceed(true);
			} else {
				setProceed(false);
			}
		}
	}

	function VerifyEmail() {
		console.log(evi_ref.current.value);
	}

	function EmailVerifyPoster() {
		console.log(evi);
		fetch("/api/user/create", {
			method: "PATCH",
			body: JSON.stringify({
				req_evi: evi,
				req_code: verification_code_ref.current.value,
			}),
		}).then((response) => {
			if (response.status === 200) {
				Router.replace("/login");
				return;
			}
			return response.json();
		});
	}

	return (
		<Pagelayout>
			<div className={style.backgroundImage}>
				<div className={style.container}>
					<SignUpModal title={page}>
						{page === "Terms and Conditions" ? (
							<div>
								<ul className={style.scrollBox}>
									{props.terms.map((term) => {
										return (
											<li
												className={style.tcitem}
												key={term.number}>
												<p>
													<strong>{term.number} </strong>
													{term.text} <br />
												</p>
												<hr className={style.tcdivider} />
											</li>
										);
									})}
								</ul>
							</div>
						) : null}

						{page === "Personal Details" ? (
							<div>
								<div className={style.inputGrid}>
									<Input
										ref={official_name_ref}
										width="100%"
										color="secondary"
										clearable
										bordered
										rounded
										helperText={<span className={style.required}> Required, used for the certificate</span>}
										label={<span>Official Name</span>}
										onInput={CheckInputs}
									/>
									<Input
										rounded
										ref={official_surname_ref}
										width="100%"
										color="secondary"
										clearable
										bordered
										helperText={<span className={style.required}> Required, used for the certificate</span>}
										label={<span>Official Surname</span>}
										onInput={CheckInputs}
									/>
									<Input
										rounded
										ref={display_name_ref}
										width="100%"
										color="secondary"
										clearable
										bordered
										helperText={<span className={style.optional}>Optional, used for the nametag</span>}
										label={<span>Display Name</span>}
										onInput={CheckInputs}
									/>
									<Input
										rounded
										ref={display_surname_ref}
										width="100%"
										color="secondary"
										clearable
										bordered
										helperText={<span className={style.optional}>Optional, used for the nametag</span>}
										label={<span>Display Surname</span>}
										onInput={CheckInputs}
									/>
									<Input
										rounded
										ref={email_ref}
										width="100%"
										color="secondary"
										clearable
										bordered
										label={<span>Email</span>}
										helperText={<span className={style.required}>Required, used as the username</span>}
										onInput={CheckInputs}
									/>
									<Input
										rounded
										ref={confirm_email_ref}
										width="100%"
										color="secondary"
										clearable
										bordered
										label={<span>Confirm Email</span>}
										helperText={<span className={style.required}> Required</span>}
										onInput={CheckInputs}
									/>
									<div className={style.dobInput}>
										<Input
											rounded
											ref={date_of_birth_ref}
											color="secondary"
											type="date"
											width="100%"
											bordered
											helperText={<span className={style.required}> Required</span>}
											label={<span>Date of Birth</span>}
											onInput={CheckInputs}
										/>
									</div>
									<Input
										rounded
										ref={password_ref}
										width="100%"
										color="secondary"
										type="password"
										clearable
										bordered
										helperText={<span className={style.required}> Required</span>}
										label={<span>Password</span>}
										onInput={CheckInputs}
									/>
									<Input
										rounded
										ref={confirm_password_ref}
										width="100%"
										color="secondary"
										clearable
										bordered
										type="password"
										helperText={<span className={style.required}> Required</span>}
										label={<span>Confirm Password</span>}
										onInput={CheckInputs}
									/>
									{passwordissue && (
										<div className={style.dobInput}>
											<h6>{passwordissue}</h6>
										</div>
									)}
								</div>
							</div>
						) : null}
						{page === "Email Verification"
							? VerifyEmail && (
									<div className={style.centered}>
										<h2 className={style.evititle}>Please enter the verification code which has been sent to {email}.</h2>
										<Input
											className={style.finalButton}
											ref={verification_code_ref}
											width="80%"
											color="secondary"
											maxLength={6}
											clearable
											bordered
											onInput={CheckVerifyInput}
											label={<span>Verification Code</span>}
										/>
										<br></br>
										<div>
											<div className={style.PAVmessage}>
												<h4>
													In case you don<span>&apos;</span>t have access to your email
												</h4>

												<h6>
													Please disregard this notice if you have access to the email account you have provided above and are able to verify your account
													normally. Give the code below to a member of staff to get your account verified temporarily if you do not have access to your email.
													You will be asked to prove your identity.
													<br />
													<strong>
														<h6 className={style.PAVcode}>
															{"PAV CODE: "}
															{evi && evi.toUpperCase()}
														</h6>
													</strong>
												</h6>
											</div>
										</div>
									</div>
							  )
							: null}
						{page === "Welcome to MEDIMUN" ? <div></div> : null}
						<div className={style.buttons}>
							{pageNumber > 1 ? (
								<Button
									color="primary"
									auto
									onPress={() => {
										pageNumber--;
										setPage(pages[pageNumber]);
									}}>
									Back
								</Button>
							) : null}
							<Spacer x={0.5} />
							{pageNumber !== 3 && pageNumber !== 1 ? (
								<Button
									color="primary"
									auto
									onPress={() => {
										pageNumber++;
										setPage(pages[pageNumber]);
									}}>
									{pageNumber === 0 ? "Agree and Proceed" : "Next"}
								</Button>
							) : null}
							{pageNumber === 1 && proceed && !(pageNumberState === 2) ? (
								<Button
									color="primary"
									auto
									onPress={() => {
										PostInfo();
									}}>
									Confirm Email
								</Button>
							) : null}
							{loading ? (
								<Button
									color="primary"
									auto>
									<Loading
										type="points-opacity"
										color="white"
									/>
								</Button>
							) : null}
							{!proceed && pageNumber === 1 && !(pageNumberState == 2) ? (
								<Button
									color="primary"
									disabled
									auto>
									Next
								</Button>
							) : null}
							{!proceed && pageNumberState === 2 ? (
								<Button
									color="primary"
									disabled
									auto>
									Verify
								</Button>
							) : null}
							{proceed && pageNumberState === 2 ? (
								<Button
									color="primary"
									onPress={EmailVerifyPoster}
									auto>
									Verify
								</Button>
							) : null}
						</div>
					</SignUpModal>
				</div>
			</div>
		</Pagelayout>
	);
}

export async function getStaticProps() {
	async function main() {
		await prisma.$connect();
		return await prisma.terms.findMany();
	}

	main()
		.then(async () => {
			await prisma.$disconnect();
		})
		.catch(async (e) => {
			console.error(e);
			await prisma.$disconnect();
			process.exit(1);
		});

	return {
		props: {
			terms: await main(),
		},
		revalidate: 450,
	};
}
