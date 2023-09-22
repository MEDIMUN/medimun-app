import Image from "next/image";
import heroImage from "@/public/pages/index/hero.png";
import HeroImage from "./HeroImage";
import { Paper } from "@/components/website/HeroImage";
import AuthRedirect from "@/components/website/AuthRedirect";
import Link from "next/link";
import { Section2 } from "./Section2";
import Logo from "@/components/website/Logo";
import Footer from "@/components/website/Footer";

const bgColor = "bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-100 to-gray-300" && "bg-gradient-to-r from-red-500 to-red-800";

const numbah = 400;

export async function HomePage() {
	return (
		<>
			<section className={"bg-[#0e0e0e]" || "bg-[#1a1a1a]" || "min-h-screen overflow-hidden bg-gradient-to-l from-red-500 to-medired" + " " + ""}>
				<div className="flex h-[60svh] w-full flex-col justify-end gap-3 -text-center align-middle md:h-[50vh]">
					<h1 className="bg-medired px-4 font-[Canela] text-[55px] font-[900] leading-[50px] tracking-tight text-white [text-shadow:_4px_4px_#000000] md:text-[80px] md:leading-[73px]">
						Strengtening Sustaınability
					</h1>
					<h2 className="px-4 font-[SequelBold] text-[55px] font-[300] leading-[45px] tracking-tight text-gray-300 [text-shadow:_2px_2px_#777]">Enchancing Global Partnerships</h2>
				</div>
				<HeroImage />
				<Paper />
			</section>
			<Section2 />
			<section className="min-h-screen"></section>
		</>
	);
}

export default function Page() {
	return (
		<>
			<div className="absolute z-[500] h-screen w-screen bg-black">
				<div className="mx-auto min-h-screen max-w-[1248px] p-5 font-[canela] text-white">
					{" "}
					<div className="w-[256px] pb-5">
						<Logo color="red" />
					</div>
					<h1 className="text-[50px] font-bold leading-[60px]">Exciting Enhancements to Our Digital Portfolio!</h1>
					<h2 className="pt-5 text-[30px] font-semibold leading-[35px]">
						Esteemed delegates and participants, our website is undergoing a meticulous redesign set to launch next month. Additionally, our brand-new application, two years in the
						making, is slated for a test release in early 2024.
					</h2>
					<h2 className="py-5 text-[30px] font-semibold leading-[35px]">
						For inquiries, please contact us at{" "}
						<a className="text-medired" href="mailto:medimun.cyprus@gmail.com">
							medimun.cyprus@gmail.com
						</a>
						. Stay tuned to our social media for crucial dates and further details.
					</h2>
					<h2 className="pt-5 text-[30px] font-semibold leading-[35px]">
						Mark your calendars: The 19<sup>th</sup> Annual Session is scheduled for February 2024. More information to come.
					</h2>
				</div>
				<Footer />
			</div>

			<AuthRedirect authenticated="/medibook/sessions" />
			{
				//<HomePage />
			}
		</>
	);
}
