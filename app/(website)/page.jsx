import Image from "next/image";
import heroImage from "@/public/pages/index/hero.png";
import HeroImage from "./HeroImage";
import { Paper } from "@/components/website/HeroImage";
import AuthRedirect from "@/components/website/AuthRedirect";
import Link from "next/link";
import { Section2 } from "./Section2";

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
