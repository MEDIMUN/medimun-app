import Link from "next/link";
import { Hero, Paper } from "./components/HeroImage";
import Section1 from "./components/Section1";
import Gallery from "./components/Gallery";
import AuthRedirect from "@/src/app/(Website)/components/AuthRedirect";
import Image from "next/image";
import es1 from "@public/placeholders/the-english-school-1.jpg";
import es2 from "@public/placeholders/the-english-school-2.jpg";
import nicosia1 from "@public/placeholders/nicosia-1.jpg";
import delegates2 from "@public/placeholders/delegates-2.jpg";
import delegates3 from "@public/placeholders/delegates-3.jpg";

const theme1 = "Building Resilience";
const theme2 = "A Transformative Agenda";
const welcomeTitle = `Welcome to MEDIMUN ${new Date().getFullYear() || ""}`;
const welcomeText =
	"We have a terrific team of students working to make our 18th Annual Conference a reality. Our conference theme this year will be Building Resilience; stressing the need to facilitate global strength and security against the conflicts and vulnerabilities faced by today's modern society. We hope that you will join us on the 3rd and 4th February 2023, at our new venue of The University of Nicosia, and feel the passion of debate on a range of crucial international issues.";

export const metadata = {
	description: "Mediterranean Model United Nations, also known as MEDIMUN is the biggest THIMUN-affiliated MUN conference in the Mediterranean Region, established in 2006.",
	themeColor: "#000000",
	keywords: ["MEDIMUN", "THIMUN", "MUN", "MEDMUN", "UCYMUN", "Mediterranean Model United Nations", "Model United Nations", "MUN Cyprus", "MUN Europe", "MYMUN"],
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
				<Hero />
				<Paper />
				<Section1>
					<div className="absolute bottom-0 mb-[63svh] w-full  text-left md:mb-[45svh]">
						<h1 className="mb-3 select-none bg-gradient-to-t from-[var(--medired)] from-80% to-80% pl-[20px] font-['Canela'] text-[70px] leading-[70px] text-white [text-shadow:_4px_4px_#000000] md:text-[120px] md:leading-[120px]">
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
									More about the conference
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
									How to apply
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
				<section className="h-[300svh]"></section>
				<section className="relative z-[6] grid min-h-[100svh] w-[100%] translate-y-12 select-none bg-[var(--medired)] p-10 text-center font-['canela'] text-white shadow-2xl sm:gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-0">
					<div className="m-auto max-h-full w-full max-w-[400px] !overflow-hidden rounded-lg">
						<Image className="globallogo min-h-full w-full overflow-hidden rounded-lg object-cover object-bottom shadow-xl duration-150 hover:scale-150" src={es2} />
					</div>
					<div className="m-auto grid max-w-[400px] rounded-[25px] p-4 px-8 duration-150 hover:scale-150">
						<div className="text-[75px]">19+</div>
						<div>years</div>
					</div>
					<div className="m-auto max-h-full max-w-[400px] !overflow-hidden rounded-lg">
						<Image className="globallogo !max-h-auto w-full overflow-hidden rounded-lg object-cover object-bottom duration-150 hover:scale-150" src={es1} />
					</div>
					<div className="m-auto max-w-[400px] rounded-[25px] p-4 px-8 duration-150 hover:scale-150">
						<div className="text-[75px]">400+</div>
						<div>delegates annually</div>
					</div>
					<div className="m-auto max-h-full max-w-[400px] !overflow-hidden rounded-lg">
						<Image className="globallogo !max-h-auto w-full overflow-hidden rounded-lg object-cover object-bottom duration-150 hover:scale-150" src={delegates3} />
					</div>
					<div className="m-auto max-w-[400px] rounded-[25px] p-4 px-8 duration-150 hover:scale-150">
						<div className="text-[75px]">5000+</div>
						<div>total delegates</div>
					</div>
					<div className="m-auto max-h-full max-w-[400px] !overflow-hidden rounded-lg">
						<Image className="globallogo !max-h-auto w-full overflow-hidden rounded-lg object-cover object-bottom duration-150 hover:scale-150" src={delegates2} />
					</div>
					<div className="m-auto max-w-[400px] rounded-[25px] p-4 px-8 duration-150 hover:scale-150">
						<div className="text-[75px]">25+</div>
						<div>nationalities</div>
					</div>
					<div className="m-auto max-h-full max-w-[400px] !overflow-hidden rounded-lg sm:block md:hidden lg:block">
						<Image className="globallogo !max-h-auto w-full overflow-hidden rounded-lg object-cover object-bottom duration-150 hover:scale-150" src={nicosia1} />
					</div>
				</section>
				<section className="h-[130svh] w-[100%]"></section>
				<section className="relative z-[6] h-[100svh] w-[100%] bg-[url('/pages/users/user/blue.jpg')] bg-cover "></section>
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
