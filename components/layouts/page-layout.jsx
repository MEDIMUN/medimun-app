import PageNavbar from "../../components/navigation/page-navbar";
import { Fragment, useState } from "react";
import style from "./page-layout.module.css";
import PageFooter from "../footers/page-footer";

function Pagelayout(props) {
	return (
		<Fragment>
			<PageNavbar text={props.notificationText || ""} />
			<div
				style={{ padding: props.margin || "10" }}
				className={style.container}>
				{props.children}
			</div>
			<div className={style.footer}>
				<PageFooter />
			</div>
		</Fragment>
	);
}

export default Pagelayout;
