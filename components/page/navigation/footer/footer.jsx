import style from "./footer.module.css";
import { BsInstagram, BsFacebook, BsYoutube } from "react-icons/bs";

import Logo from "../../../common/branding/logo/main";
import { Spacer, Text } from "@nextui-org/react";

function PageFooter() {
	const currentYear = new Date().getFullYear();
	return (
		<footer>
			<div className={style.footer}>
				<div>
					<Logo
						className={style.logo}
						color={"white"}
						width={200}
						height={50}
					/>
				</div>

				<div />

				<div className={style.socials}>
					<div className={style.social}>
						<BsInstagram className={style.socialicon} />
					</div>
					<div className={style.social}>
						<BsFacebook className={style.socialicon} />
					</div>
					<div className={style.social}>
						<BsYoutube className={style.socialicon} />
					</div>
				</div>
			</div>
			<div className={style.bottom}>
				<div className={style.textholder1}>
					<Text className={style.text}>Copyright © {currentYear} MEDIMUN. All rights reserved.</Text>
				</div>
				<div className={style.textholder2}>
					<Text className={style.text}>Terms and Conditions</Text>
				</div>
				<div className={style.textholder3}>
					<Text className={style.text}>Privacy Policy</Text>
				</div>
			</div>
		</footer>
	);
}

export default PageFooter;
