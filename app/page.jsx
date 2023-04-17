import Image from "next/image";
import style from "./page.module.css";
import HeroImage from "./HeroImage";
import Section1 from "./Section1";

export default function Page() {
	return (
		<div className={style.page}>
			<div>
				<HeroImage />
			</div>
			<Section1>
				<div className={style.heroText}>
					<h1>Building Resilience</h1>
					<h2>A Transformative Agenda</h2>
				</div>
			</Section1>
			<section></section>
			<section></section>
		</div>
	);
}
