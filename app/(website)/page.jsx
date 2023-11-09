import Image from "next/image";
import HeroImage from "./HeroImage";
import { Paper } from "@/components/website/HeroImage";
import AuthRedirect from "@/components/website/AuthRedirect";
import Link from "next/link";
import { Section2 } from "./Section2";
import Gallery from "@/components/website/Gallery";
import Logo from "@/components/website/Logo";
import Footer from "@/components/website/Footer";
import heroImage from "@/public/pages/index/hero2.png";
import { Button } from "@/components/ui/button";

const bgColor = "bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-100 to-gray-300" && "bg-gradient-to-r from-red-500 to-red-800";

const numbah = 400;

export async function HomePage() {
	return (
		<>
			<section className={"min-h-[100svh] bg-medired md:min-h-screen"}>
				<div className="flex h-[45svh] w-full flex-col justify-end gap-3 px-5 align-middle duration-300 md:h-[50vh] md:text-center">
					<h1 className="-[text-shadow:_4px_4px_#000000] font-[canela] text-[50px] font-[750] leading-[50px] tracking-tight text-white md:text-[90px] md:leading-[83px]">
						Strengtening Sustainability
					</h1>
					<h2 className="-[text-shadow:_2px_2px_#777]  font-[SequelBold] text-[40px] font-[300] leading-[35px] tracking-tight text-gray-100">Enchancing Global Partnerships</h2>
				</div>
				<HeroImage />
			</section>
			<Section2 />
			<Gallery />
			<section className="h-[750px] bg-black font-[montserrat] duration-300 md:h-[250px]">
				<div className="mx-auto grid h-full max-w-[1260px] grid-cols-1 gap-5 p-5 pt-[10px] md:grid-cols-3">
					<div className="text-900 h-full overflow-hidden rounded-xl border-2 border-slate-200 bg-[url(/placeholders/the-english-school-1.jpg)] bg-cover duration-300 hover:shadow-xl">
						<div className="flex h-full w-full flex-col bg-white bg-opacity-50 p-5">
							<div className="">
								About The English School <br />
								<span className="text-sm">Discover the rich history spanning over 120 years of the creators behind MEDIMUN.</span>
							</div>
							<Link className="ml-auto mt-auto" href="https://www.englishschool.ac.cy/" target="_blank">
								<Button>Learn More</Button>
							</Link>
						</div>
					</div>
					<div className="text-900 h-full overflow-hidden rounded-xl border-2 border-slate-200 bg-[url(/pages/index/medibook.png)] bg-cover object-bottom duration-300 hover:shadow-xl">
						<div className="flex h-full w-full flex-col bg-white bg-opacity-70 p-5">
							<div>
								About The MediBook App <br />
								<span className="text-sm">Discover MediBook, the essential MEDIMUN companion app designed for your convenience and efficiency.</span>
							</div>
							<Link className="ml-auto mt-auto" href="/medibook">
								<Button>Learn More</Button>
							</Link>
						</div>
					</div>
					<div className="text-900 h-full overflow-hidden rounded-xl border-2 border-slate-200 bg-[url(/pages/index/branding-3.png)] bg-cover object-bottom duration-300 hover:shadow-xl">
						<div className="flex h-full w-full flex-col bg-white bg-opacity-40 p-5">
							<div>
								About The MediBook App <br />
								<span className="text-sm">Our branding and identity guidelines to ensure a consistent representation of our brand across all channels.</span>
							</div>
							<Link className="ml-auto mt-auto" href="">
								<Button disabled>Download</Button>
							</Link>
						</div>
					</div>{" "}
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
