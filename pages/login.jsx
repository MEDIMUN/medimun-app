import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signIn, getSession } from "next-auth/react";

import style from "../styles/login.module.css";

import { Button, Input, Spacer } from "@nextui-org/react";
import Logo from "../components/common/branding/logo/main";
import Pagelayout from "../components/page/layout/layout";

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
function LoginPage(props) {
	const emailInputRef = useRef();
	const passwordInputRef = useRef();

	const router = useRouter();

	async function submitHandler() {
		const enteredEmail = emailInputRef.current.value;
		const enteredPassword = passwordInputRef.current.value;

		const result = await signIn("credentials", {
			redirect: false,
			email: enteredEmail,
			password: enteredPassword,
		});

		if (!result.error) {
			router.replace("/app");
		}

		console.log(result);
	}

	return (
		<Pagelayout margin="0">
			<div className={style.background}>
				<div className={style.container}>
					<div className={style.panel}></div>

					<div className={style.loginModal}>
						<div className={style.gradient}>
							<div className="loginItems">
								<Logo
									color={"blue"}
									width={200}
									height={50}
								/>
								<Spacer y={2} />
								<Input
									size="lg"
									color={"blue"}
									width={"200px"}
									clearable
									bordered
									labelPlaceholder="Email"
									ref={emailInputRef}
									active
								/>
								<Spacer y={2} />
								<Input.Password
									size="lg"
									color={"#FFFFFF"}
									width={"200px"}
									clearable
									bordered
									labelPlaceholder="Password"
									ref={passwordInputRef}
									active
								/>
								<Spacer y={2} />
								<div className={style.ButtonGroup}>
									<Button
										onPress={submitHandler}
										but
										css={{ width: "100%", borderRadius: "10px 10px 0 0" }}>
										Login
									</Button>
									<Button
										color={"mediBlue"}
										css={{ width: "100%", color: "#000000", backgroundColor: "none", borderRadius: "0" }}>
										Forgot Password
									</Button>
									<Button
										color={"mediBlueLight"}
										css={{ width: "100%", color: "#000000", borderRadius: "0 0 10px 10px" }}>
										Sign Up
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Pagelayout>
	);
}

export default LoginPage;

export async function getServerSideProps(context) {
	const session = await getSession({ req: context.req });

	if (session) {
		return {
			redirect: {
				destination: "/app",
				permament: false,
			},
		};
	}
	return {
		props: { session },
	};
}
