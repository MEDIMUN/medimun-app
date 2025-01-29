import { ContactUsForm } from "./client-components";
import { Building, Mail, Phone } from "lucide-react";

export default async function Page(props) {
	const searchParams = await props.searchParams;
	const sitekey = process.env.RECAPTCHA_SITE_KEY;
	return (
		<div className="relative isolate min-h-screen bg-black font-[Montserrat] text-white">
			<div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
				<div className="relative px-6 pb-20 pt-24 sm:pt-32 lg:static lg:px-8 lg:py-48">
					<div className="mx-auto mt-10 max-w-xl lg:mx-0 lg:mt-0 lg:max-w-lg">
						<div className="absolute inset-y-0 left-0 -z-10 w-full overflow-hidden bg-gray-800 ring-1 ring-gray-900/10 lg:w-1/2">
							<svg
								className="absolute inset-0 h-full w-full stroke-gray-800 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
								aria-hidden="true">
								<defs>
									<pattern id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527" width={200} height={200} x="100%" y={-1} patternUnits="userSpaceOnUse">
										<path d="M130 200V.5M.5 .5H200" fill="none" />
									</pattern>
								</defs>
								<rect width="100%" height="100%" strokeWidth={0} fill="black" />
								<svg x="100%" y={-1} className="overflow-visible fill-gray-950">
									<path d="M-470.5 0h201v201h-201Z" strokeWidth={0} />
								</svg>
								<rect width="100%" height="100%" strokeWidth={0} fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)" />
							</svg>
						</div>
						<h2 className="text-3xl font-bold tracking-tight text-gray-200">Get in touch</h2>
						<p className="mt-6 text-lg leading-8 text-gray-300">
							We welcome your inquiries and feedback. Please do not hesitate to contact us with any questions or comments you may have.
						</p>
						<dl className="mt-10 space-y-4 text-base leading-7 text-gray-200">
							<div className="flex gap-x-4">
								<dt className="flex-none">
									<span className="sr-only">Address</span>
									<Building className="h-7 w-6 text-gray-400" aria-hidden="true" />
								</dt>
								<dd>
									0 Kyriakou Matsi Avenue & Presidential Palace Road
									<br />
									1082 Strovolos, Nicosia Cyprus
								</dd>
							</div>
							<div className="flex gap-x-4">
								<dt className="flex-none">
									<span className="sr-only">Telephone</span>
									<Phone className="h-7 w-6 text-gray-400" aria-hidden="true" />
								</dt>
								<dd>
									<a className="hover:text-gray-900" href="tel:+35722799300">
										+357 22 799 300
									</a>
								</dd>
							</div>
							<div className="flex gap-x-4">
								<dt className="flex-none">
									<span className="sr-only">Email</span>
									<Mail className="h-7 w-6 text-gray-400" aria-hidden="true" />
								</dt>
								<dd>
									<a className="hover:text-gray-900" href="medimun.cyprus@gmail.com">
										info@medimun.org
									</a>
								</dd>
							</div>
						</dl>
					</div>
				</div>
				<ContactUsForm sitekey={sitekey} />
			</div>
		</div>
	);
}
