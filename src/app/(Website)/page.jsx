import Link from "next/link";
import HeroImage from "./components/HeroImage";
import Section1 from "./components/Section1";
import Gallery from "./components/Gallery";
import AuthRedirect from "@/src/app/(Website)/components/AuthRedirect";

const theme1 = "Building Resilience";
const theme2 = "A Transformative Agenda";
const welcomeTitle = `Welcome to MEDIMUN ${new Date().getFullYear() || ""}`;
const welcomeText =
	"We have a terrific team of students working to make our 18th Annual Conference a reality. Our conference theme this year will be Building Resilience; stressing the need to facilitate global strength and security against the conflicts and vulnerabilities faced by today's modern society. We hope that you will join us on the 3rd and 4th February 2023, at our new venue of The University of Nicosia, and feel the passion of debate on a range of crucial international issues.";

export const metadata = {
	title: "Home - MEDIMUN",
	description: "The biggest THIMUN-affiliated MUN conference in the Mediterranean Region, established in 2005.",
	themeColor: "#000000",
};

const sectionStyle =
	"relative z-[5] min-h-[15svh] h-min w-[calc(100%-24px)] mx-auto max-w-[1400px] rounded-2xl px-6 py-[40px] shadow-[0_0_25px_rgb(0_0_0_/_0.4)] duration-200 my-auto bg-[#181818]" +
	" ";
const outerStyle = "relative z-[5] w-[100%]  py-4" + " ";

export function HomePage() {
	return (
		<>
			<Gallery />
			<div className="rounded-[5px] bg-white">
				<HeroImage />
				<Section1>
					<div className="w-full pb-[225px] text-left">
						<h1 className="mb-3 select-none bg-gradient-to-t from-[var(--medired)] from-80% pl-[20px] font-['Canela'] text-[70px] leading-[70px] text-white [text-shadow:_4px_4px_#000000] md:text-[120px] md:leading-[120px]">
							{theme1}
						</h1>
						<h2 className="ml-[20px] select-none stroke-white font-['Canela'] text-[40px] leading-[45px] text-[var(--medired)] [-webkit-text-stroke-color:_rgb(255,255,255);] [-webkit-text-stroke-width:_1px;] md:text-[70px] md:leading-[70px]">
							{theme2}
						</h2>
					</div>
				</Section1>
				<div className="h-[100svh]"></div>
				<div id="totalH">
					<section className={outerStyle + "bg-gradient-to-t from-[var(--medired)]"}>
						<div className={sectionStyle}>
							<div className="mx-auto max-w-[1400px]">
								<h1 className="mb-4 from-80% pl-[20px] font-['Canela'] text-[30px] leading-[40px] text-transparent [-webkit-text-stroke-color:_rgb(255,255,255);] [-webkit-text-stroke-width:_1px;] md:text-[50px] md:leading-[55px]">
									{welcomeTitle}
								</h1>
								<h2 className="mb-3 from-80% pl-[20px] font-['Canela'] text-[15px] leading-[20px] text-white [text-shadow:_2px_2px_#000000] md:text-[30px]  md:leading-[40px]">
									{welcomeText}
								</h2>
								<Link href="/medibook">
									<h2 className="mb-3 w-[210px] cursor-pointer rounded-[100px] from-80% pl-[20px] font-['canela'] text-[15px] leading-[45px] text-gray-400 duration-200 [text-shadow:_2px_2px_#000000] hover:ml-[20px] hover:bg-white hover:text-[var(--medired)] hover:shadow-lg hover:[text-shadow:_none] md:text-[25px]">
										Learn more →
									</h2>
								</Link>
							</div>
						</div>
					</section>
					<section className={outerStyle + "bg-[var(--medired)]"}>
						<div className={sectionStyle}>
							<div className="mx-auto max-w-[1400px]">
								<h1 className="mb-4 from-80% pl-[20px] font-['Canela'] text-[30px] leading-[40px] text-transparent [-webkit-text-stroke-color:_rgb(255,255,255);] [-webkit-text-stroke-width:_1px;] md:text-[50px] md:leading-[55px]">
									{welcomeTitle}
								</h1>
								<h2 className="mb-3 from-80% pl-[20px] font-['Canela'] text-[15px] leading-[20px] text-white [text-shadow:_2px_2px_#000000] md:text-[30px]  md:leading-[40px]">
									{welcomeText}
								</h2>
								<Link href="/medibook">
									<h2 className="mb-3 w-[210px] cursor-pointer rounded-[100px] from-80% pl-[20px] font-['canela'] text-[15px] leading-[45px] text-gray-400 duration-200 [text-shadow:_2px_2px_#000000] hover:ml-[20px] hover:bg-white hover:text-[var(--medired)] hover:shadow-lg hover:[text-shadow:_none] md:text-[25px]">
										Learn more →
									</h2>
								</Link>
							</div>
						</div>
					</section>
					<section className={outerStyle + "bg-gradient-to-b from-[var(--medired)]"}>
						<div className={sectionStyle}>
							<div className="mx-auto max-w-[1400px]">
								<h1 className="mb-4 from-80% pl-[20px] font-['Canela'] text-[30px] leading-[40px] text-transparent [-webkit-text-stroke-color:_rgb(255,255,255);] [-webkit-text-stroke-width:_1px;] md:text-[50px] md:leading-[55px]">
									{welcomeTitle}
								</h1>
								<h2 className="mb-3 from-80% pl-[20px] font-['Canela'] text-[15px] leading-[20px] text-white [text-shadow:_2px_2px_#000000] md:text-[30px]  md:leading-[40px]">
									{welcomeText}
								</h2>
								<Link href="/medibook">
									<h2 className="mb-3 w-[210px] cursor-pointer rounded-[100px] from-80% pl-[20px] font-['canela'] text-[15px] leading-[45px] text-gray-400 duration-200 [text-shadow:_2px_2px_#000000] hover:ml-[20px] hover:bg-white hover:text-[var(--medired)] hover:shadow-lg hover:[text-shadow:_none] md:text-[25px]">
										Learn more →
									</h2>
								</Link>
							</div>
						</div>
					</section>
				</div>
				<section className="h-[100svh]"></section>
				<section className="h-[100svh] w-[100%]"></section>
				<section className="h-[100svh] w-[100%]"></section>
				<section className="relative z-[6] h-[100svh] w-[100%] translate-y-12 bg-[var(--medired)]"></section>
			</div>
		</>
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
