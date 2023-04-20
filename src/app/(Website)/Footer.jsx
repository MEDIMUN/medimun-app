"use client";

import Link from "next/link";
import style from "./Footer.module.css";

import Logo from "./Logo";
import { Text } from "@chakra-ui/react";
import { ChakraProvider } from "@chakra-ui/react";

const currentYear = new Date().getFullYear();

export default function Footer() {
	return (
		<ChakraProvider>
			<footer className={style.wrapper}>
				<div className={style.sitemap}>
					<ul>
						<text>The Conference</text>
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
						<text>The Application</text>
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
						<text>Important Stuff</text>
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
				<div className={style.bottomText}>
					<div>
						<Link href="https://facebook.com/medimun">FaceBook</Link>
						<Link href="https://instagram.com/medimun.cy">Instagram</Link>
						<Link href="https://www.youtube.com/@medimun8808">YouTube</Link>
						<Link href="https://www.twitter.com/medimun">Twitter</Link>
					</div>
					<div className={style.logo}>
						<Logo color="black" quality={100} />
					</div>
					<div>©{currentYear} Mediterranean Model United Nations</div>
				</div>
			</footer>
		</ChakraProvider>
	);
}
