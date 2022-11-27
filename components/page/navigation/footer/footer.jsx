import style from "./footer.module.css";

import Logo from "../../../common/branding/logo/main";

function PageFooter() {
	let currentYear = 2022;
	return (
		<footer>
			<div className={style.footer}>
				<div>
					<Logo
						color={"white"}
						width={200}
						height={50}
					/>
				</div>

				<div />

				<div>
					<p>Social Media Icons</p>
				</div>
			</div>
		</footer>
	);
}

export default PageFooter;
