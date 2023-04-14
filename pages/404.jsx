import style from "../styles/404.module.css";
import { Navbar, Spacer } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/router";
import Logo from "@logo";

function NotFound() {
	const router = useRouter();

	return (
		<div className={style.frame}>
			<div className={style.logo}>
				<Logo color={"white"} width={170} height={42.5} />
			</div>

			<img src="/pages/404/notfound.gif" className={style.background}></img>
			<div className={style.center}>
				<div>
					<h1 className={style.nfSmallText}>
						Looks like you<span>&apos;</span>ve reached an empty GA.
						<sup>404</sup>
					</h1>
				</div>
			</div>
			<Spacer y={2} />
			<div className={style.center}>
				<Button className={style.button} onPress={() => router.back()} color={"white"} size={"lg"}>
					<p className={style.buttonText}>Back</p>
				</Button>
			</div>
		</div>
	);
}

export default NotFound;
