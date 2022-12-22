import Pagelayout from "../components/page/layout/layout";
import { getSession, useSession } from "next-auth/react";
import Layout from "../app-components/layout";
import Image from "next/image";
import style from "../styles/index.module.css";
import { SlArrowDown } from "react-icons/sl";
import { Button, Spacer, Text } from "@nextui-org/react";
import { Fragment, useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function HomePage(props) {
	const router = useRouter();
	const [height, setHeight] = useState();
	const [year, setYear] = useState();
	const [herotext1, setherotext1] = useState("Building Resilience");
	const [herotext2, setherotext2] = useState("A Transformative Agenda");
	const section2 = useRef(null);
	const { data: session, status } = useSession();
	var time = new Date();
	const currentYear = new Date().getFullYear();

	useEffect(() => {
		setYear(currentYear);
	}, [currentYear]);

	let greeting;
	if (time.getHours() >= 12) {
		greeting = "Good afternoon";
	}
	if (time.getHours() >= 18) {
		greeting = "Good evening";
	}

	function scrollToSection(section) {
		window.scrollTo(0, height * section);
	}

	const [scrollPosition, setScrollPosition] = useState(0);
	const handleScroll = () => {
		const position = window.pageYOffset;
		const height = window.innerHeight;
		setHeight(height);
		const section = position / height;
		const r = document.querySelector(":root");
		setScrollPosition(position);
		if (position == 0) {
			r.style.setProperty("--indexherofilter", 1);
		} else {
			r.style.setProperty("--indexherofilter", 1 - section);
		}

		if (section > 0.75) {
			r.style.setProperty("--index-hero-translate-y", `${(section * 300 - 225) * 1}px`);
			console.log((section * 300 - 225) * 1);
		} else {
			r.style.setProperty("--index-hero-translate-y", "0px");
		}

		if (section < 1) {
			r.style.setProperty("--index-section3-image", "repeating-linear-gradient(45deg, #000000, #000000 10px, #181818 10px, #181818 20px)");
			setherotext1("Building Resilience");
			setherotext2("A Transformative Agenda");
		} else {
			r.style.setProperty(
				"--index-section3-image",
				`repeating-linear-gradient(-45deg, rgba(255,255,255,var(  --mediblueopacity)), rgba(255,255,255,var(  --mediblueopacity)) 10px, var(--section3-photo-background) 10px, var(--section3-photo-background) 20px)`
			);

			setherotext1("");
			setherotext2("");
		}

		if (section > 1.5) {
			const mediblueopacity = 1 - (section - 1.5) / 1;
			if (mediblueopacity < 255) {
				r.style.setProperty("--section3-photo-background", `rgba(41,127,201,${mediblueopacity})`);
				r.style.setProperty("--mediblueopacity", mediblueopacity);
			} else {
				r.style.setProperty("--mediblueopacity", `1`);
			}
		}

		if (section > 3.11) {
			r.style.setProperty("--section3-images-translate-y", `${((section - 3.11) * height) / 3 - 10}px`);
		} else {
			r.style.setProperty("--section3-images-translate-y", "0px");
		}
	};

	useEffect(() => {
		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	if (!session) {
		return (
			<Fragment>
				<Head>
					<meta
						name="theme-color"
						content="#000000"></meta>
				</Head>
				<Pagelayout>
					<div className={style.body}></div>
					<div className={style.section0}>
						<div>
							<Button
								onPress={() => {
									section2.current?.scrollIntoView({ behavior: "smooth" });
								}}
								size="auto"
								className={style.buttonholder}>
								<SlArrowDown className={style.buttonarrow} />
							</Button>
						</div>
						<div className={style.section0image}>
							<div className={style.imageherocolor}></div>
						</div>
						<div className={style.section0text}>
							<div>
								<Text
									className={style.herotext1}
									h1
									size={120}
									weight="bold">
									{herotext1}
								</Text>
								<Spacer y={1} />
								<Text
									className={style.herotext2}
									h1
									size={120}
									weight="light">
									{herotext2}
								</Text>
							</div>
						</div>
					</div>
					<div className={style.section2}>
						<div
							className={style.section2ref}
							ref={section2}></div>
						<Text
							className={style.herotext3}
							h1
							size={120}
							weight="bold">
							Welcome to
							<br />
							<strong>MEDIMUN {year}</strong>
						</Text>
						<Spacer y={1} />
						<Text className={style.herotext4}>
							We have a terrific team of students working to make our 18th Annual Conference a reality. Our conference theme this year will be Building
							Resilience; stressing the need to facilitate global strength and security against the conflicts and vulnerabilities faced by today
							<span>&apos;</span>s modern society. We hope that you will join us on the 3rd and 4th February 2023, at our new venue of The University of
							Nicosia, and feel the passion of debate on a range of crucial international issues.
						</Text>
					</div>
					<div className={style.section3}>
						<div className={style.imageholder}>
							<Image
								src="/pages/index/section3images/1.jpeg"
								width={2976 / 2}
								height={1984 / 2}
								alt="people in a general assembly"></Image>
							<Image
								src="/pages/index/section3images/2.jpeg"
								width={2976 / 2}
								height={1984 / 2}
								alt="people in a general assembly"></Image>
							<Image
								src="/pages/index/section3images/3.jpeg"
								width={2976 / 2}
								height={1984 / 2}
								alt="people in a general assembly"></Image>{" "}
							<Image
								src="/pages/index/section3images/4.jpeg"
								width={2976 / 2}
								height={1984 / 2}
								alt="people in a general assembly"></Image>
							<Image
								src="/pages/index/section3images/5.jpeg"
								width={2976 / 2}
								height={1984 / 2}
								alt="people in a general assembly"></Image>{" "}
							<Image
								src="/pages/index/section3images/6.jpeg"
								width={2976 / 2}
								height={1984 / 2}
								alt="people in a general assembly"></Image>
						</div>
					</div>
					<div className={style.section4}>
						<div>
							<Text
								className={style.herotext5}
								h1
								size={120}
								weight="bold">
								Want to join?
							</Text>
							<Text
								className={style.herotext5}
								h1
								size={120}
								weight="bold">
								Sign Up Today to apply!
							</Text>
							<Spacer y={2} />
							<Button
								onPress={() => router.replace("/sign-up")}
								css={{ width: "100px", borderRadius: "50px" }}
								size="lg"
								color="#FFFFFF"
								className={style.createbutton}>
								Create Your Account
							</Button>
						</div>
					</div>
				</Pagelayout>
			</Fragment>
		);
	}

	if (session) {
		return (
			<Layout page={"Register"}>
				<h2>{greeting + ", " + session.user.display_name || session.user.official_name}</h2>
			</Layout>
		);
	}
}
