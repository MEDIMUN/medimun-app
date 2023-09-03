import Logo from "@/components/website/Logo";
import MediBookLogo from "@public/assets/branding/logos/medibook-logo-white-2.svg";

export default async function Footer() {
	return (
		<footer className="bg-[#0E0E0E] sm:mt-10">
			<div className="justify-left m-auto flex max-w-6xl flex-wrap align-middle text-gray-800 ">
				<div className="w-1/2 p-5 sm:w-4/12 md:w-3/12">
					<div className="h-[64px]">
						<Logo color="black" className="relative max-h-[50px]" />
					</div>
				</div>
			</div>
		</footer>
	);
}

{
	/* <div className="p-5 w-1/2 sm:w-4/12 md:w-3/12">
					<div className="text-xs uppercase text-gray-400 font-medium mb-6">Getting Started</div>
					<a href="#" className="my-3 block text-gray-300 hover:text-gray-100 text-sm font-medium duration-700">
						Installation
					</a>
					<a href="#" className="my-3 block text-gray-300 hover:text-gray-100 text-sm font-medium duration-700">
						Release Notes
					</a>
					<a href="#" className="my-3 block text-gray-300 hover:text-gray-100 text-sm font-medium duration-700">
						Upgrade Guide
					</a>
				</div>
				<div className="p-5 w-1/2 sm:w-4/12 md:w-3/12">
					<div className="text-xs uppercase text-gray-400 font-medium mb-6">Core Concepts</div>
					<a href="#" className="my-3 block text-gray-300 hover:text-gray-100 text-sm font-medium duration-700">
						Utility-First
					</a>
					<a href="#" className="my-3 block text-gray-300 hover:text-gray-100 text-sm font-medium duration-700">
						Responsive Design
					</a>
					<a href="#" className="my-3 block text-gray-300 hover:text-gray-100 text-sm font-medium duration-700">
						Hover, Focus, & Other States
					</a>
				</div>
				<div className="p-5 w-1/2 sm:w-4/12 md:w-3/12">
					<div className="text-xs uppercase text-gray-400 font-medium mb-6">Customization</div>
					<a href="#" className="my-3 block text-gray-300 hover:text-gray-100 text-sm font-medium duration-700">
						Configuration
					</a>
					<a href="#" className="my-3 block text-gray-300 hover:text-gray-100 text-sm font-medium duration-700">
						Theme Configuration
					</a>
					<a href="#" className="my-3 block text-gray-300 hover:text-gray-100 text-sm font-medium duration-700">
						Breakpoints
					</a>
				</div> */
}
