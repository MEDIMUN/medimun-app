import { Link } from "@nextui-org/link";
import { Hero, Paper } from "@/components/website/HeroImage";
import Section1 from "@/components/website/Section1";
import Gallery from "@/components/website/Gallery";
import AuthRedirect from "@/components/website/AuthRedirect";
import Image from "next/image";
import es1 from "@/public/placeholders/the-english-school-1.jpg";
import es2 from "@/public/placeholders/the-english-school-2.jpg";
import nicosia1 from "@/public/placeholders/nicosia-1.jpg";
import delegates2 from "@/public/placeholders/delegates-2.jpg";
import delegates3 from "@/public/placeholders/delegates-3.jpg";
import prisma from "@/prisma/client";
const welcomeTitle = `Welcome to MEDIMUN`;
const welcomeText = "We have a terrific team of students working to make our 18th Annual Conference a reality. Our conference theme this year will be Building Resilience; stressing the need to facilitate global strength and security against the conflicts and vulnerabilities faced by today's modern society. We hope that you will join us on the 3rd and 4th February 2023, at our new venue of The University of Nicosia, and feel the passion of debate on a range of crucial international issues.";

export const metadata = {
	description: "Mediterranean Model United Nations, also known as MEDIMUN is the biggest THIMUN-affiliated MUN conference in the Mediterranean Region, established in 2006.",
	themeColor: "#000000",
	keywords: ["MEDIMUN", "THIMUN", "MUN", "MEDMUN", "UCYMUN", "Mediterranean Model United Nations", "Model United Nations", "MUN Cyprus", "MUN Europe", "MYMUN"],
};

const sectionStyle = "relative z-[5] min-h-[15svh] h-min w-[calc(100%-24px)] mx-auto max-w-[1400px] rounded-2xl px-6 py-[40px] shadow-[0_0_25px_rgb(0_0_0_/_0.4)] duration-200 my-auto bg-[#181818]" + " ";
const outerStyle = "relative z-[5] w-[100%]  py-4" + " ";

export const revalidate = 300;

async function getTheme() {
	let theme;
	try {
		theme = await prisma.session.findFirst({
			where: {
				isCurrent: true,
			},
			select: {
				theme: true,
				phrase2: true,
				number: true,
			},
		});
	} catch (error) {}
	return theme;
}

export function LearnMoreButton(props) {
	return (
		<Link href={props.href}>
			<button className="mb-3 w-[210px] cursor-pointer rounded-[100px] from-80% pl-[20px] font-['canela'] text-[15px] leading-[45px] text-gray-400 duration-200 [text-shadow:_2px_2px_#000000] hover:ml-[20px] hover:bg-white hover:text-primary hover:shadow-lg hover:[text-shadow:_none] md:text-[25px]">{props.children}</button>
		</Link>
	);
}

export async function HomePage() {
	const currentSession = await getTheme();
	const theme = currentSession?.theme || "";
	const phrase2 = currentSession?.phrase2 || "";
	return (
		<>
			<Gallery />
			<div className="rounded-[5px] bg-white">
				<Hero />
				<Paper />
				<Section1>
					<div className="bottom-0 mb-[46vh] mt-auto w-full text-left ">
						<h2 className="mb-3 select-none bg-gradient-to-t from-primary from-80% to-80% pl-[20px] font-['montserrat'] text-[52px] leading-[55px] text-white [text-shadow:_4px_4px_#000000] md:text-[100px] md:leading-[110px]">{theme}</h2>
						<h2 className="ml-[20px] select-none stroke-white font-['Canela'] text-[35px] leading-[35px] text-primary [-webkit-text-stroke-color:_rgb(255,255,255);] [-webkit-text-stroke-width:_1px;] md:text-[50px] md:leading-[70px]">{phrase2}</h2>
					</div>
				</Section1>
				<div className="h-[100svh]"></div>
				<div id="totalH">
					<section className={outerStyle + "bg-gradient-to-t from-primary"}>
						<div className={sectionStyle}>
							<div className="mx-auto max-w-[1400px]">
								<h1 className="mb-4 from-80% pl-[20px] font-['Canela'] text-[30px] leading-[40px] text-transparent [-webkit-text-stroke-color:_rgb(255,255,255);] [-webkit-text-stroke-width:_1px;] md:text-[50px] md:leading-[55px]">{welcomeTitle}</h1>
								<p className="mb-3 from-80% pl-[20px] font-['Canela'] text-[15px] leading-[20px] text-white [text-shadow:_2px_2px_#000000] md:text-[30px]  md:leading-[40px]">{welcomeText}</p>
								<LearnMoreButton href="/">Learn more</LearnMoreButton>
							</div>
						</div>
					</section>
					<section className={outerStyle + "bg-primary"}>
						<div className={sectionStyle}>
							<div className="mx-auto max-w-[1400px]">
								<h3 className="mb-4 from-80% pl-[20px] font-['Canela'] text-[30px] leading-[40px] text-transparent [-webkit-text-stroke-color:_rgb(255,255,255);] [-webkit-text-stroke-width:_1px;] md:text-[50px] md:leading-[55px]">More about the conference</h3>
								<p className="mb-3 from-80% pl-[20px] font-['Canela'] text-[15px] leading-[20px] text-white [text-shadow:_2px_2px_#000000] md:text-[30px]  md:leading-[40px]">{welcomeText}</p>
								<LearnMoreButton href="/">Learn more</LearnMoreButton>
							</div>
						</div>
					</section>
					<section className={outerStyle + "bg-primary"}>
						<div className={sectionStyle}>
							<div className="mx-auto max-w-[1400px]">
								<h3 className="mb-4 from-80% pl-[20px] font-['Canela'] text-[30px] leading-[40px] text-transparent [-webkit-text-stroke-color:_rgb(255,255,255);] [-webkit-text-stroke-width:_1px;] md:text-[50px] md:leading-[55px]">How to apply</h3>
								<p className="mb-3 from-80% pl-[20px] font-['Canela'] text-[15px] leading-[20px] text-white [text-shadow:_2px_2px_#000000] md:text-[30px]  md:leading-[40px]">{welcomeText}</p>
								<LearnMoreButton href="/">Learn more</LearnMoreButton>
							</div>
						</div>
					</section>
					<section className={outerStyle + "bg-primary"}>
						<div className={sectionStyle}>
							<div className="mx-auto max-w-[1400px]">
								<h3 className="mb-4 from-80% pl-[20px] font-['Canela'] text-[30px] leading-[40px] text-transparent [-webkit-text-stroke-color:_rgb(255,255,255);] [-webkit-text-stroke-width:_1px;] md:text-[50px] md:leading-[55px]">The MediBook App</h3>
								<p className="mb-3 from-80% pl-[20px] font-['Canela'] text-[15px] leading-[20px] text-white [text-shadow:_2px_2px_#000000] md:text-[30px]  md:leading-[40px]">{welcomeText}</p>
								<LearnMoreButton href="/">Learn more</LearnMoreButton>
							</div>
						</div>
					</section>
					<section className={outerStyle + "bg-gradient-to-b from-primary"}>
						<div className={sectionStyle}>
							<div className="mx-auto max-w-[1400px]">
								<h3 className="mb-4 from-80% pl-[20px] font-['Canela'] text-[30px] leading-[40px] text-transparent [-webkit-text-stroke-color:_rgb(255,255,255);] [-webkit-text-stroke-width:_1px;] md:text-[50px] md:leading-[55px]">Past Conferences</h3>
								<p className="mb-3 from-80% pl-[20px] font-['Canela'] text-[15px] leading-[20px] text-white [text-shadow:_2px_2px_#000000] md:text-[30px]  md:leading-[40px]">{welcomeText}</p>
								<LearnMoreButton href="/">Learn more</LearnMoreButton>
							</div>
						</div>
					</section>
				</div>
				<section className="h-[300svh]"></section>
				<section className="relative z-[6] grid min-h-[100svh] w-[100%] translate-y-12 select-none bg-primary p-10 text-center font-['canela'] text-white shadow-2xl sm:gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-0">
					<div className="m-auto max-h-full w-full max-w-[400px] !overflow-hidden rounded-lg">
						<Image alt="Image of The English School in Cyprus and the surrounding forest" className="globallogo min-h-full w-full overflow-hidden rounded-lg object-cover object-bottom shadow-xl duration-150 hover:scale-150" quality={50} src={es2} />
					</div>
					<div className="m-auto grid max-w-[400px] rounded-[25px] p-4 px-8 duration-150 hover:scale-150">
						<div className="text-[75px]">19+</div>
						<div>years</div>
					</div>
					<div className="m-auto max-h-full max-w-[400px] !overflow-hidden rounded-lg">
						<Image alt="Image of The English School taken from the front" className="globallogo !max-h-auto w-full overflow-hidden rounded-lg object-cover object-bottom duration-150 hover:scale-150" quality={50} src={es1} />
					</div>
					<div className="m-auto max-w-[400px] rounded-[25px] p-4 px-8 duration-150 hover:scale-150">
						<div className="text-[75px]">400+</div>
						<div>delegates annually</div>
					</div>
					<div className="m-auto max-h-full max-w-[400px] !overflow-hidden rounded-lg">
						<Image alt="500 delegates standing up at the end of a plenary session" className="globallogo !max-h-auto w-full overflow-hidden rounded-lg object-cover object-bottom duration-150 hover:scale-150" quality={50} src={delegates3} />
					</div>
					<div className="m-auto max-w-[400px] rounded-[25px] p-4 px-8 duration-150 hover:scale-150">
						<div className="text-[75px]">5000+</div>
						<div>total delegates</div>
					</div>
					<div className="m-auto max-h-full max-w-[400px] !overflow-hidden rounded-lg">
						<Image alt="Delegates and the organising body of the conference taking a picture outside" className="globallogo !max-h-auto w-full overflow-hidden rounded-lg object-cover object-bottom duration-150 hover:scale-150" quality={50} src={delegates2} />
					</div>
					<div className="m-auto max-w-[400px] rounded-[25px] p-4 px-8 duration-150 hover:scale-150">
						<div className="text-[75px]">25+</div>
						<div>nationalities</div>
					</div>
					<div className="m-auto max-h-full max-w-[400px] !overflow-hidden rounded-lg sm:block md:hidden lg:block">
						<Image alt="An image of Cyprus's capital Nicosia taken from above" className="globallogo !max-h-auto w-full overflow-hidden rounded-lg object-cover object-bottom duration-150 hover:scale-150" quality={50} src={nicosia1} />
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
