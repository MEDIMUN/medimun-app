import Image from "next/image";
import style from "./page.module.css";
import HeroImage from "./components/HeroImage";
import Section1 from "./components/Section1";
import RegisterButton from "./components/RegisterButton";
import AuthRedirect from "@/src/app/(Website)/components/AuthRedirect";

const currentYear = new Date().getFullYear();

const theme1 = "Building Resilience";

export const metadata = {
	title: "Home - MEDIMUN",
	description: "The biggest THIMUN-affiliated MUN conference in the Mediterranean Region, established in 2005.",
	themeColor: "#000000",
};

export function HomePage() {
	return (
		<div className={style.page}>
			<div>
				<HeroImage />
			</div>
			<Section1>
				<div className={style.heroText}>
					<h1>
						{theme1.split(" ").map((word, index) => (
							<span key={index} className={style.themeOneWord}>
								{word + " "}
							</span>
						))}
					</h1>
					<h2>A Transformative Agenda</h2>
				</div>
			</Section1>
			<section>
				<div className={style.heroText2}>
					<h1>Welcome to MEDIMUN {currentYear}</h1>
					<h2>We have a terrific team of students working to make our 18th Annual Conference a reality. Our conference theme this year will be Building Resilience; stressing the need to facilitate global strength and security against the conflicts and vulnerabilities faced by today's modern society. We hope that you will join us on the 3rd and 4th February 2023, at our new venue of The University of Nicosia, and feel the passion of debate on a range of crucial international issues.</h2>
					<RegisterButton />
				</div>
			</section>
			<section></section>
			<section></section>
		</div>
	);
}

export default function Page() {
	return (
		<>
			<AuthRedirect authenticated="/medibook" />
			<HomePage />
		</>
	);
}
