import style from "../styles/email/webmail.module.css";
import Layout from "../app-components/layout";

export default function Webmail() {
	return (
		<Layout>
			<div>
				<iframe
					className={style.iframe}
					src="https://mail.manage.beoz.org/mail"></iframe>{" "}
			</div>
		</Layout>
	);
}
