import PageNavbar from "../../components/navigation/page-navbar";
import { Fragment, useState } from "react";
import style from "./page-layout.module.css";
import PageFooter from "../footers/page-footer";

function Pagelayout(props) {
	return (
		<Fragment>
			<PageNavbar text={props.notificationText || ""} />
			<div className={style.container}>
				{props.children}
				<PageFooter />
			</div>
		</Fragment>
	);
}

export default Pagelayout;
