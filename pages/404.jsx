import style from "../styles/404.module.css";
import { Navbar, Spacer } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/router";
import Logo from "../components/common/branding/logo/main";

function NotFound() {
	const router = useRouter();

	return (
		<div className={style.frame}>
			<div className={style.logo}>
				<Logo
					color={"white"}
					width={170}
					height={42.5}
				/>
			</div>

			<video
				autoPlay
				loop
				muted
				src="/pages/404/notfound.mp4"
				className={style.background}
				playsinline
			/>
			<div className={style.center}>
				<div>
					<h1 className={style.nfText}>404</h1>
				</div>
				<div>
					<h1 className={style.nfSmallText}>
						Looks Like You<span>&apos;</span>ve reached an empty GA
					</h1>
				</div>
			</div>
			<Spacer y={2} />
			<div className={style.center}>
				<Button
					onPress={() => router.back()}
					color={"white"}
					size={"lg"}>
					<p className={style.buttonText}>Back</p>
				</Button>
			</div>
		</div>
	);
}

export default NotFound;
