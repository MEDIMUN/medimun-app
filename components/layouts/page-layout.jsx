import Navbar from "../../components/navigation/page-navbar";
import { Fragment, useState } from "react";
import style from "./page-layout.module.css";

function Pagelayout(props) {
	return (
		<Fragment className={style.page}>
			<Navbar text={props.notificationText || ""} />
			<div className={style.container}>{props.children}</div>
		</Fragment>
	);
}

export default Pagelayout;
