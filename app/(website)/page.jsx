import Image from "next/image";
import HeroImage from "./HeroImage";
import { Paper } from "@/components/website/HeroImage";
import AuthRedirect from "@/components/website/AuthRedirect";
import Link from "next/link";
import { Section2 } from "./Section2";
import Logo from "@/components/website/Logo";
import Footer from "@/components/website/Footer";
import heroImage from "@/public/pages/index/hero2.png";

const bgColor = "bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-100 to-gray-300" && "bg-gradient-to-r from-red-500 to-red-800";

const numbah = 400;

export async function HomePage() {
	return (
		<>
			<section className={"min-h-screen bg-medired"}>
				<div className="flex h-[45svh] w-full flex-col justify-end gap-3 px-5 align-middle duration-300 md:h-[50vh] md:text-center">
					<h1 className="-[text-shadow:_4px_4px_#000000] font-[canela] text-[50px] font-[750] leading-[50px] tracking-tight text-white md:text-[90px] md:leading-[83px]">
						Strengtening Sustainability
					</h1>
					<h2 className="-[text-shadow:_2px_2px_#777]  font-[SequelBold] text-[40px] font-[300] leading-[35px] tracking-tight text-gray-100">Enchancing Global Partnerships</h2>
					{/* 					<h1 className="bg-medired px-4 font-[Canela] text-[55px] font-[900] leading-[50px] tracking-tight text-white [text-shadow:_4px_4px_#000000] md:text-[80px] md:leading-[73px]">
						Strengtening Sustainability
					</h1>
					<h2 className="px-4 font-[SequelBold] text-[55px] font-[300] leading-[45px] tracking-tight text-gray-300 [text-shadow:_2px_2px_#777]">Enchancing Global Partnerships</h2> */}
				</div>
				<HeroImage />
			</section>
			<Section2 />
		</>
	);
}

export default function Page() {
	return (
		<>
			<div className="absolute z-[500] h-auto w-screen bg-black">
				<div className="mx-auto h-auto min-h-screen max-w-[1248px] p-5 font-[montserrat] font-[800] text-white">
					{" "}
					<div className="w-[256px] pb-5">
						<Logo color="red" />
					</div>
					<h1 className="text-[40px] font-bold leading-[40px]">Exciting Enhancements to Our Digital Portfolio!</h1>
					<h2 className="py-5 text-[20px] font-semibold leading-[25px]">
						Our website is undergoing a meticulous redesign set to launch next month. Additionally, our brand-new application, two years in the making, is slated for a test release
						in early 2024.
					</h2>
					<h2 className="rounded-xl bg-medired p-5 text-[20px] font-semibold leading-[25px]">
						Delegate Applications are now open!
						<br />
						Please complete the{" "}
						<a target="_blank" className="text-yellow-500 underline" href="https://forms.gle/YJjpbrQXKLnxYVLo9">
							Form 1
						</a>
						{", "}
						<a target="_blank" className="text-yellow-500 underline" href="https://forms.gle/TtA2qFJ7YirkBmkF8">
							Form 2
						</a>
						{", "}
						<a target="_blank" className="text-yellow-500 underline" href="https://forms.gle/YJjpbrQXKLnxYVLo9">
							Form 3
						</a>
						{", "}
						and{" "}
						<a target="_blank" className="text-yellow-500 underline" href="https://forms.gle/TtA2qFJ7YirkBmkF8">
							Form 4
						</a>{" "}
						After checking out the{" "}
						<a target="_blank" className="text-yellow-500 underline" href="https://drive.google.com/file/d/1BBBbX8RepI6toL4M2WUS3KE2IkuM2g2d/view?usp=sharing">
							prospectus
						</a>
						. Please note that we do not accept individual delegate applications. All applications must be submitted by a school or a registered organization.
					</h2>
					<h2 className="pt-5 text-[20px] font-semibold leading-[25px]">
						Mark your calendars:
						<br />
						The 19<sup>th</sup> Annual Session is scheduled for 2<sup>nd</sup> to 4<sup>th</sup> of February 2024.
						<br />
						The workshop will be held on the 18
						<sup>th</sup> of November 2023. At The English School.
					</h2>
					<h2 className="py-5 text-[20px] font-semibold leading-[25px]">
						For inquiries, please contact us at{" "}
						<a className="text-medired" href="mailto:medimun.cyprus@gmail.com">
							medimun.cyprus@gmail.com
						</a>
						. Stay tuned to our social media for crucial dates and further details.
					</h2>
				</div>
			</div>

			<AuthRedirect authenticated="/medibook/sessions" />
			{
				//<HomePage />
			}
		</>
	);
}
