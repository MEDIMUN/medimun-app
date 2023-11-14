import Image from "next/image";
import HeroImage from "./HeroImage";
import { Paper } from "@/components/website/HeroImage";
import AuthRedirect from "@/components/website/AuthRedirect";
import Link from "next/link";
import { Section2 } from "./Section2";
import Gallery from "./Gallery";
import Logo from "@/components/website/Logo";
import Footer from "@/components/website/Footer";
import heroImage from "@/public/pages/index/hero2.png";
import { Button } from "@/components/ui/button";

const bgColor = "bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-100 to-gray-300" && "bg-gradient-to-r from-red-500 to-red-800";

const numbah = 400;

export async function HomePage() {
	return (
		<>
			<section className={"min-h-[100vh] bg-gradient-to-r from-medired to-red-500 md:min-h-screen"}>
				<div className="flex h-[45svh] w-full flex-col justify-end gap-3 px-5 align-middle duration-300 md:h-[50vh] md:text-center">
					<h1 className="-[text-shadow:_4px_4px_#000000] font-[canela] text-[50px] font-[750] leading-[50px] tracking-tight text-white md:text-[90px] md:leading-[83px]">
						Strengtening Sustainability
					</h1>
					<h2 className="-[text-shadow:_2px_2px_#777]  font-[SequelBold] text-[40px] font-[300] leading-[35px] tracking-tight text-gray-100">Enchancing Global Partnerships</h2>
				</div>
				<HeroImage />
				<div className="absolute right-[calc(50%-.5px)] top-0 z-[0] h-[25vh] w-[1px] bg-gradient-to-b from-white to-transparent"></div>
				<div className="absolute bottom-0 right-[calc(50%-.5px)] z-[0] h-[45vh] w-[1px] bg-gradient-to-t from-white to-transparent"></div>
			</section>
			<Section2 />
			<Gallery />
			<section className="hidden h-[50vh] w-full flex-row bg-gray-200 font-[LondiniaMedium] md:flex">
				<div className="top-screen absolute right-[calc(50%-.5px)] z-[0] h-[25vh] w-[1px] bg-gradient-to-b from-black to-transparent opacity-50" />
				<div className="absolute right-[calc(50%-.5px)] top-[175vh] z-[0] h-[25vh] w-[1px] bg-gradient-to-t from-black to-transparent" />
				<div className="mr-auto flex h-full w-[50vw] flex-col gap-5 p-5">
					<p className="mt-auto p-5 text-[25px] leading-[30px] md:text-[30px] md:leading-[30px] lg:text-[33px] lg:leading-[42px]">
						They research their nation's policies to draft and debate resolutions on global issues, fostering diverse and in-depth discussions.
					</p>
				</div>
			</section>
			<section className="z-[0] h-[750px] bg-black font-[montserrat] duration-300 md:h-[250px]">
				<div className="mx-auto grid h-full max-w-[1260px] grid-cols-1 gap-5 p-5 md:grid-cols-3">
					<div className="text-900 h-full overflow-hidden rounded-xl border-0 border-slate-200 bg-[url(/placeholders/the-english-school-1.jpg)] bg-cover bg-bottom duration-300 hover:shadow-xl">
						<div className="flex h-full w-full flex-col bg-gradient-to-b from-white via-white via-45% to-transparent p-5">
							<div className="">
								About The English School <br />
								<span className="text-sm">Discover the rich history spanning over 120 years of the creators behind MEDIMUN.</span>
							</div>
							<Link className="ml-auto mt-auto" href="https://www.englishschool.ac.cy/" target="_blank">
								<Button>Learn More</Button>
							</Link>
						</div>
					</div>
					<div className="text-900 h-full overflow-hidden rounded-xl border-0 border-slate-200 bg-[url(/pages/index/medibook.png)] bg-cover bg-top duration-300 hover:shadow-xl">
						<div className="flex h-full w-full flex-col bg-gradient-to-b from-white via-white via-45% to-transparent p-5">
							<div>
								About The MediBook App <br />
								<span className="text-sm">Discover MediBook, the essential MEDIMUN companion app designed for your convenience and efficiency.</span>
							</div>
							<Link className="ml-auto mt-auto" href="/medibook">
								<Button>Learn More</Button>
							</Link>
						</div>
					</div>
					<div className="text-900 h-full overflow-hidden rounded-xl border-0 border-slate-200 bg-[url(/pages/index/branding-3.png)] bg-cover bg-top duration-300 hover:shadow-xl">
						<div className=" flex h-full w-full flex-col bg-gradient-to-b from-white via-white via-45% to-transparent p-5">
							<div>
								Branding and Identity Guidelines <br />
								<span className="text-sm">Our branding and identity guidelines to ensure a consistent representation of our brand across all channels.</span>
							</div>
							<Link className="ml-auto mt-auto" href="">
								<Button disabled>Download</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}

export default function Page() {
	return (
		<>
			<AuthRedirect authenticated="/medibook/sessions" />
			<HomePage />
		</>
	);
}
