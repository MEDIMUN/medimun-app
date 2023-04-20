import style from "./page.module.css";
import Login from "./Login";

export default async function Page() {
	return (
		<div className={style.page}>
			<div className={style.sidebarOverlay}>
				<Login />
			</div>
			<div aria-hidden className={style.sidebar}>
				<h1 className={style.title}>Login</h1>
			</div>
		</div>
	);
}
