import Link from "next/link";
import thimunLogo from "@/public/assets/branding/thimun/thimun-logo.png";

import Logo from "./Logo";
import Image from "next/image";

const currentYear = new Date().getFullYear();

export default function Footer() {
	return (
		<footer className="relative z-[40] bg-black">
			<div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
				<div className="flex flex-col items-center gap-4 rounded-lg bg-[var(--medired)] p-6 shadow-lg sm:flex-row sm:justify-between">
					<strong className="text-xl text-white sm:text-xl">Ready to join?</strong>

					<Link
						className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-8 py-3 text-[var(--medired)] duration-200 hover:bg-transparent hover:text-white focus:outline-none focus:ring active:bg-white/90"
						href="/signup">
						<span className="text-sm font-medium"> Let's Get Started </span>

						<svg className="h-5 w-5 rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
						</svg>
					</Link>
				</div>

				<div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
					<div className="text-center sm:text-left">
						<p className="text-lg font-medium text-white">About Us</p>

						<ul className="mt-8 space-y-4 text-sm">
							<li>
								<Link className="text-gray-400 transition hover:text-gray-400/75" href="/about">
									History
								</Link>
							</li>

							<li>
								<Link className="text-gray-400 transition hover:text-gray-400/75" href="/team">
									Meet the Team
								</Link>
							</li>

							<li>
								<a className="text-gray-400 transition hover:text-gray-400/75" href="/">
									Careers
								</a>
							</li>
						</ul>
					</div>

					<div className="text-center sm:text-left">
						<p className="text-lg font-medium text-white">Our Technologies</p>

						<ul className="mt-8 space-y-4 text-sm">
							<li>
								<a className="text-gray-400 transition hover:text-gray-400/75" href="/">
									Web Development
								</a>
							</li>

							<li>
								<a className="text-gray-400 transition hover:text-gray-400/75" href="/">
									Web Design
								</a>
							</li>

							<li>
								<a className="text-gray-400 transition hover:text-gray-400/75" href="/">
									Marketing
								</a>
							</li>
						</ul>
					</div>

					<div className="text-center sm:text-left">
						<p className="text-lg font-medium text-white">Resources</p>

						<ul className="mt-8 space-y-4 text-sm">
							<li>
								<Link className="text-gray-400 transition hover:text-gray-400/75" href="/resources#resolutions">
									Resolution Booklets
								</Link>
							</li>

							<li>
								<Link className="text-gray-400 transition hover:text-gray-400/75" href="/resources#delegate">
									Delegate Resources
								</Link>
							</li>

							<li>
								<Link className="text-gray-400 transition hover:text-gray-400/75" href="/resources#school">
									School Resources
								</Link>
							</li>
						</ul>
					</div>

					<div className="text-center sm:text-left">
						<p className="text-lg font-medium text-white">Helpful Links</p>

						<ul className="mt-8 space-y-4 text-sm">
							<li>
								<Link className="text-gray-400 transition hover:text-gray-400/75" href="/privacy">
									Privacy Policy
								</Link>
							</li>

							<li>
								<a className="text-gray-400 transition hover:text-gray-400/75" href="/terms">
									Terms of Service
								</a>
							</li>
							<li>
								<Link className="text-gray-400 transition hover:text-gray-400/75" target="_blank" href="https://foundation.thimun.org/">
									THIMUN Foundation
								</Link>
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-16">
					<ul className="flex justify-center gap-6 sm:justify-end">
						<li>
							<Link href="https://fb.me/medimun" rel="noreferrer" target="_blank" className="text-white transition hover:text-[var(--medired)]">
								<span className="sr-only">Facebook</span>
								<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
									<path
										fillRule="evenodd"
										d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
										clipRule="evenodd"
									/>
								</svg>
							</Link>
						</li>

						<li>
							<Link href="https://instagram.com/medimun.cy" rel="noreferrer" target="_blank" className="text-white transition hover:text-[var(--medired)]">
								<span className="sr-only">Instagram</span>
								<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
									<path
										fillRule="evenodd"
										d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
										clipRule="evenodd"
									/>
								</svg>
							</Link>
						</li>
					</ul>

					<div className="mt-16 sm:flex sm:items-center sm:justify-between">
						<div className="flex justify-center text-teal-600 sm:justify-start">
							<div className=" mx-auto flex max-w-[600px] flex-row gap-6">
								<div className="m-auto flex max-w-[200px] justify-center align-middle">
									<Logo className="globallogo " color="black" quality={100} />
								</div>
								<div className="m-auto flex max-w-[200px] justify-center align-middle">
									<Image alt="Logo of the THIMUN Foundation" className="globallogo w-min rounded-2xl" src={thimunLogo}></Image>
								</div>
							</div>{" "}
						</div>
						<p className="mt-4 text-center text-sm font-light text-gray-500 sm:mt-0 sm:text-right">
							<Link
								href="http://foundation.thimun.org/affiliation-programme/affiliated-conferences/#february"
								target="_blank"
								className="duration-200 hover:mb-2 hover:rounded-full hover:bg-white hover:px-4 hover:text-[var(--medired)] hover:after:content-['_↗']">
								<strong>MEDIMUN</strong> is affiliated with the <strong>THIMUN Foundation</strong>
							</Link>
							<br />
							&copy; 2006-{currentYear} <strong>Mediterranean Model United Nations</strong>, aka <strong>MEDIMUN</strong>
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
