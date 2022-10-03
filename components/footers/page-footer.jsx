import Logo from "../logos/main-logo";
import style from "./page-footer.module.css";

function PageFooter() {
	let currentYear = 2022;
	return (
		<footer>
			<div className={style.footer}>
				<div>
					<Logo color={"white"} />
				</div>

				<div />

				<div>
					<p>Social Media</p>
				</div>
			</div>
		</footer>
	);
}

export default PageFooter;
