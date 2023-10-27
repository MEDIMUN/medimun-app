import Logo from "@/components/website/Logo";
import MediBookLogo from "@public/assets/branding/logos/medibook-logo-white-2.svg";

export default async function Footer() {
	return (
		<footer className="bg-[#0E0E0E] font-[montserrat]">
			<div className="flex flex-row p-6">
				<Logo color="black" className="h-[64px] max-w-min" />
				<div className="ml-auto mt-auto h-6 px-6  text-white">
					v{process.env.VERSION}
					{parseInt(process.env.VERSION[0]) < 1 && " BETA"}
				</div>
			</div>
			<div className="bg-gray-600 px-6 py-2 text-[10px] text-white	">Copyright © {new Date().getFullYear()} Mediterranean Model United Nations. All rights reserved.</div>
		</footer>
	);
}
