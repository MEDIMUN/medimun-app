import style from "../../styles/login.module.css";
import { Button, Input, Spacer } from "@nextui-org/react";
import Logo from "../../components/logos/main-logo";
import Navigation from "../../components/navigation/page-navbar.jsx";
import { Fragment } from "react";

function LoginPage() {
	return (
		<Fragment>
			<Navigation text={""} />
			<div className={style.background}>
				<div className={style.container}>
					<div className={style.panel}></div>

					<div className={style.loginModal}>
						<div className="loginItems">
							<Logo color={"blue"} />
							<Spacer y={2} />
							<Input
								color={"blue"}
								width={"200px"}
								clearable
								bordered
								labelPlaceholder="Name"
								active
							/>
							<Spacer y={2} />
							<Input.Password
								color={"#FFFFFF"}
								width={"200px"}
								clearable
								bordered
								labelPlaceholder="Password"
								active
							/>
							<Spacer y={2} />
							<div className={style.ButtonGroup}>
								<Button css={{ width: "100%", borderRadius: "10px 10px 0 0" }}>Login</Button>
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
		</Fragment>
	);
}

export default LoginPage;
