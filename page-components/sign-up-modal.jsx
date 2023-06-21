import style from "./sign-up-modal.module.css";

function SignUpModal(props) {
	return (
		<div className={style.container}>
			<div className={style.title}>
				<h2 className={style.accountText}>
					Create Account
					<span> → </span>
					{props.title}
				</h2>
			</div>

			<div className={style.inner}>{props.children}</div>
			<div className={style.progressBarFrame}></div>
		</div>
	);
}

export default SignUpModal;
