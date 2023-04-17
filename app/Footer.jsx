"use client";

import { BsInstagram, BsFacebook, BsYoutube } from "react-icons/bs";
import style from "./Footer.module.css";

import Logo from "./Logo";
import { Text } from "@chakra-ui/react";
import { ChakraProvider } from "@chakra-ui/react";

export default function Footer() {
	const currentYear = new Date().getFullYear();
	return (
		<ChakraProvider>
			<footer className={style.wrapper}>
				<div className={style.sitemap}>
					<div>
						<Text>Website & App</Text>
						<Text>The App</Text>
						<Text>Create an Account</Text>
						<Text>Development</Text>
						<Text>Our Technologies</Text>
					</div>
					<div>
						<Text>Website & App</Text>
						<Text>The App</Text>
						<Text>Create an Account</Text>
						<Text>Development</Text>
						<Text>Our Technologies</Text>
					</div>
					<div>
						<Text fontSize="18.51px" color="white">
							Get In Touch
						</Text>
						<Text>Contact Us</Text>
						<Text>School Registeration</Text>
						<Text>Create an Account</Text>
						<Text>Development</Text>
					</div>
				</div>
				<div className={style.logo}>
					<Logo color="white" quality={100} />
				</div>
				<div className={style.bottomText}>
					<div>
						<Text onClick={() => window.open("https://facebook.com/medimun", "_blank")}>FaceBook</Text>
						<Text onClick={() => window.open("https://instagram.com/medimun.cy", "_blank")}>Instagram</Text>
						<Text onClick={() => window.open("https://www.youtube.com/@medimun8808", "_blank")}>YouTube</Text>
						<Text onClick={() => window.open("#", "_blank")}>Twitter</Text>
					</div>
					<div>© 2005 - {currentYear} Mediterranean Model United Nations</div>
				</div>
			</footer>
		</ChakraProvider>
	);
}
