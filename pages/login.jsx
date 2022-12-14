import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";

import style from "../styles/login.module.css";

import { Button, Input, Spacer, Text } from "@nextui-org/react";
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
			router.replace("/");
		}

		console.log(result);
	}

	return (
		<div className={style.background}>
			<div className={style.loginModal}>
				<div>
					<Logo
						className={style.logo}
						color={"white"}
						width={200}
						height={50}
					/>
				</div>
				<div>
					<Text
						className={style.title}
						size={45}
						css={{
							fontFamily: "'Roboto', sans-serif",
							lineHeight: "55px",
						}}>
						Sign in to your account
					</Text>
				</div>
				<div>
					<Input
						css={{ color: "white" }}
						size="lg"
						width={"auto"}
						labelPlaceholder="Email or Username"
						ref={emailInputRef}
						active
					/>
					<Spacer y={2} />
					<Input.Password
						size="lg"
						color={"#FFFFFF"}
						width={"auto"}
						labelPlaceholder="Password"
						ref={passwordInputRef}
						active
					/>
				</div>
				<div>
					<Button
						size="md"
						rounded
						color="blue"
						onPress={submitHandler}>
						Sign in
					</Button>
				</div>
				<div className={style.buttons}>
					<div>
						<Text
							color="white"
							size={"12px"}>
							Don<span>&apos;</span>t have an account yet?
						</Text>
						<Link href={"/sign-up"}>
							<Text
								size={"12px"}
								style={{ cursor: "pointer" }}
								color="white">
								Create one
							</Text>
						</Link>
					</div>

					<Link href={"/sign-up"}>
						<Text
							size={"12px"}
							style={{ cursor: "pointer" }}
							color="white">
							Reset Password
						</Text>
					</Link>
				</div>
				<br />
			</div>
			<div className={style.panel}></div>
		</div>
	);
}

export default LoginPage;

export async function getServerSideProps(context) {
	const session = await getSession({ req: context.req });

	if (session) {
		return {
			redirect: {
				destination: "/",
				permament: false,
			},
		};
	}
	return {
		props: { session },
	};
}
