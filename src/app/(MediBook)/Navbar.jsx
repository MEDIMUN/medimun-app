import style from "./Navbar.module.css";

import Breadcrumb from "./Breadcrumbs";
import Submenu from "./SubMenu";

export default async function Navbar() {
	return (
		<nav className={style.nav}>
			<Breadcrumb />
			<Submenu />
		</nav>
	);
}
