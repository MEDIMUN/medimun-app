"use client";

import style from "@styles/404.module.css";

export default function NotFound() {
	return (
		<div className={style.frame}>
			<div className={style.logo}></div>

			<img src="/pages/404/notfound.gif" className={style.background}></img>
			<div className={style.center}>
				<div>
					<h1 className={style.nfSmallText}>
						Looks like you<span>&apos;</span>ve reached an empty GA.
						<sup>404</sup>
					</h1>
				</div>
			</div>
			<div className={style.center}></div>
		</div>
	);
}
