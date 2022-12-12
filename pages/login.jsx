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
				<Logo
					className={style.logo}
					color={"blue"}
					width={200}
					height={50}
				/>
				<Spacer y={1} />
				<Text
					className={style.title}
					size={45}
					css={{
						fontFamily: "'Roboto', sans-serif",
						lineHeight: "55px",
					}}>
					Sign in to your account
				</Text>
				<Spacer y={5} />

				<Input
					size="lg"
					color={"blue"}
					width={"auto"}
					underlined
					labelPlaceholder="Email or Username"
					ref={emailInputRef}
					active
				/>
				<Spacer y={2} />
				<Input.Password
					size="lg"
					color={"#FFFFFF"}
					width={"auto"}
					underlined
					labelPlaceholder="Password"
					ref={passwordInputRef}
					active
				/>
				<Spacer y={5} />

				<div className={style.ButtonGroup}>
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
						<Text size={"12px"}>
							Don<span>&apos;</span>t have an account yet?
						</Text>
						<Link href={"/sign-up"}>
							<Text
								size={"12px"}
								color="var(--mediblue)">
								Create one
							</Text>
						</Link>
					</div>
					<Spacer y={4} />
					<div className={style.forgot}>
						<Text size={"10px"}>
							Forgot password feature will be added soon. For now please contact us in such cases. Sorry for any inconvinience caused. You may be asked to
							verify your email.
						</Text>
					</div>
				</div>
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
