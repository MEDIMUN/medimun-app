import style from "./Navbar.module.css";

import Breadcrumb from "./Breadcrumbs";
import NavOptions from "./NavOptions";

export default async function Navbar() {
	return (
		<nav className={style.nav}>
			<div className="flex-column flex">
				<Breadcrumb />
				<NavOptions />
			</div>
		</nav>
	);
}
