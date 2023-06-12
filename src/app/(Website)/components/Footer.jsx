import Link from "next/link";
import thimunLogo from "@public/logos/thimun-logo.png";

import Logo from "./Logo";
import Image from "next/image";

const currentYear = new Date().getFullYear();

export default function Footer() {
	return (
		<footer className="relative bottom-0 z-50  h-auto w-full bg-[#181818]">
			<div className="grid grid-cols-3 text-center">
				<ul>
					<text className="text-gray-300">The Conference</text>
					<li>
						<Link href="/about">About</Link>
					</li>
					<li>
						<Link href="/conference">Conference</Link>
					</li>
					<li>
						<Link href="/session">Session</Link>
					</li>
					<li>
						<Link href="/people">Our People</Link>
					</li>
				</ul>
				<ul>
					<text className="text-gray-300">The Application</text>
					<li>
						<Link href="/about/medibook">MediBook</Link>
					</li>
					<li>
						<Link href="signup">Sign Up</Link>
					</li>
					<li>
						<Link href="/login">Login</Link>
					</li>
					<li>
						<Link href="/about/medibook">Innovations</Link>
					</li>
				</ul>

				<ul>
					<text className="text-gray-300">Important Stuff</text>
					<li>
						<Link href="/contact">Privacy Policy</Link>
					</li>
					<li>
						<Link href="/register/school">Terms & Conditions</Link>
					</li>
					<li>
						<Link href="/register">Contact Us</Link>
					</li>
					<li>
						<Link href="/branding">Branding Guidelines</Link>
					</li>
				</ul>
			</div>
			<div className="m-2 grid h-auto w-full gap-2 rounded-md bg-[var(--medired)] p-3 text-white  md:grid-cols-2">
				<div className=" mx-auto flex max-w-[600px] flex-row gap-6">
					<div className="m-auto flex max-w-[200px] justify-center align-middle">
						<Logo className="globallogo " color="red" quality={100} />
					</div>
					<div className="m-auto flex max-w-[200px] justify-center align-middle">
						<Image className="globallogo w-min rounded-2xl" src={thimunLogo}></Image>
					</div>
				</div>
				<div className="relative my-[10px] justify-center align-bottom text-[14px]">
					<div className="bottom-0 mt-auto w-full text-center font-light text-gray-400">
						<strong>MEDIMUN</strong> is Affiliated with the <strong>THIMUN Foundation</strong>
					</div>
					<div className="bottom-0 w-full text-center text-white">
						©{currentYear} Mediterranean Model United Nations <strong>MEDIMUN</strong>
					</div>
				</div>
			</div>
		</footer>
	);
}
