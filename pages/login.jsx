import { useRef, useState } from "react";
import { useRouter } from "next/router";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import { IoClose } from "react-icons/io5";
import { useToast } from "@chakra-ui/react";

import style from "../styles/login.module.css";

import { Button, Input, Spacer, Text, Loading } from "@nextui-org/react";
import Logo from "../components/common/branding/logo/main";
import Pagelayout from "../app-components/layout";

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
function LoginPage(props) {
	const emailInputRef = useRef();
	const passwordInputRef = useRef();
	const toast = useToast();
	const [loading, setLoading] = useState(false);

	const router = useRouter();

	async function submitHandler() {
		const enteredEmail = emailInputRef.current.value;
		const enteredPassword = passwordInputRef.current.value;
		setLoading(true);

		const result = await signIn("credentials", {
			redirect: false,
			email: enteredEmail,
			password: enteredPassword,
		});

		if (result.error == "no user found") {
			setLoading(false);
			if (!toast.isActive("username")) {
				toast({
					id: "username",
					title: "Incorrect Username",
					status: "error",
					duration: 2000,
					isClosable: true,
					position: "bottom-right",
				});
			}
		}

		if (result.error == "incorrect password") {
			setLoading(false);
			if (!toast.isActive("password")) {
				toast({
					id: "password",
					title: "Incorrect Password",
					status: "error",
					duration: 2000,
					isClosable: true,
					position: "bottom-right",
				});
			}
		}

		if (!result.error) {
			toast({
				title: "Signed in successfully",
				status: "success",
				duration: 4000,
				isClosable: true,
				position: "bottom-right",
			});
			router.replace("/");
		}
	}

	return (
		<div className={style.background}>
			<div>
				<Button
					css={{ backgroundColor: "transparent", width: "40px", height: "40px" }}
					onClick={() => router.back()}
					size="auto">
					<IoClose />
				</Button>
			</div>
			<div className={style.loginModal}>
				<div>
					<Logo className={style.logo} color={"white"} width={200} height={50} />
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
					/>
					<Spacer y={2} />
					<Input.Password
						size="lg"
						color={"#FFFFFF"}
						width={"auto"}
						labelPlaceholder="Password"
						ref={passwordInputRef}
					/>
				</div>
				<div>
					{!loading ? (
						<Button size="md" rounded css={{ color: "white" }} onPress={submitHandler}>
							Sign in
						</Button>
					) : (
						<Button disabled size="md" rounded css={{ color: "white", width: "100%" }}>
							<Loading type="points" />
						</Button>
					)}
				</div>
				<div className={style.buttons}>
					<div>
						<Text color="white" size={"12px"}>
							Don<span>&apos;</span>t have an account yet?
						</Text>
						<Link href={"/sign-up"}>
							<Text size={"12px"} style={{ cursor: "pointer" }} color="white">
								Create one
							</Text>
						</Link>
					</div>

					<Link href={"/sign-up"}>
						<Text size={"12px"} style={{ cursor: "pointer" }} color="white">
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
