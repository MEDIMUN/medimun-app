import { FastLink } from "@/components/fast-link";
import DelegatesImage from "@/public/assets/images/plenary-flags.jpg";
import Image from "next/image";
import Logo from "@/public/assets/branding/logos/logo-medired.svg";

export default function AuthLayout({ children }) {
	return (
		<div className="grid relative isolate min-h-svh dark bg-black font-[Gilroy] lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
					<div
						style={{
							clipPath:
								"polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
						}}
						className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-288.75"
					/>
				</div>
				<div className="flex justify-center gap-2 md:justify-start">
					<FastLink href="/" className="flex items-center gap-2 font-medium">
						<Image src={Logo} alt="MEDIMUN Logo" width={160} height={48} />
					</FastLink>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">{children}</div>
				</div>
			</div>
			<div className="relative hidden lg:block">
				<Image
					src={DelegatesImage}
					alt="Delegates stadning outside to take a conference photo."
					className="absolute scale-x-[-1] grayscale inset-0 h-full w-full object-cover"
				/>
				<div className="w-full h-full absolute backdrop-blur-[3px]" />
			</div>
		</div>
	);
}
