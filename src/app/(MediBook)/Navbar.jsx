import style from "./Navbar.module.css";

import Breadcrumb from "./Breadcrumbs";
import Submenu from "./SubMenu";
import NavOptions from "./NavOptions";

export default async function Navbar() {
	return (
		<nav className={style.nav}>
			<div className="flex flex-column">
				<Breadcrumb />
				<NavOptions />
			</div>
			<Submenu />
		</nav>
	);
}
