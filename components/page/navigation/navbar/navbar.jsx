import { Fragment } from "react";
import style from "./navbar.module.css";

import { Dropdown, Navbar, Button, Link, Text, css, Spacer } from "@nextui-org/react";

import Logo from "../../../common/branding/logo/main";

function Navigation(props) {
	console.log(props.backgroundColor);
	let navbackground;
	let navtext;
	let navlogo;
	if (props.backgroundColor === "white") {
		navbackground = "white";
		navtext = "var(--mediblue)";
		navlogo = "blue";
	} else {
		navbackground = "var(--navbar-background-color)";
		navtext = "var(--navbar-text-color)";
		navlogo = "white";
	}
	console.log("wersdf" + navtext);
	return (
		<Fragment>
			<Navbar
				className={style.navbar}
				css={{
					color: `${navtext}`,
					backgroundColor: `${navbackground}`,
					$$navbarBackgroundColor: "transparent",
					$$navbarBlurBackgroundColor: "transparent",
				}}
				isCompact
				maxWidth="fluid"
				variant="sticky">
				<Navbar.Brand>
					<Logo
						color={`${navlogo}`}
						width={170}
						height={42.5}
					/>
				</Navbar.Brand>
				<Navbar.Toggle
					showIn="sm"
					css={{ color: navtext }}></Navbar.Toggle>
				<Navbar.Content
					enableCursorHighlight
					variant="underline"
					hideIn="sm">
					<Navbar.Link
						css={{ color: navtext }}
						variant="underline"
						href="/">
						Experience
					</Navbar.Link>

					<Navbar.Link
						css={{ color: navtext }}
						variant="underline"
						href="/">
						Conference
					</Navbar.Link>
					<Navbar.Link
						css={{ color: navtext }}
						variant="underline"
						href="/">
						Enrolling
					</Navbar.Link>
					<Navbar.Link
						css={{ color: navtext }}
						variant="underline"
						href="/">
						App
					</Navbar.Link>
					<Navbar.Link
						css={{ color: navtext }}
						variant="underline"
						href="/">
						Contact
					</Navbar.Link>
				</Navbar.Content>
				<Navbar.Content hideIn={"sm"}>
					<Navbar.Link
						css={{ color: navtext }}
						variant="underline"
						href="/login"
						hideIn="sm">
						Login
					</Navbar.Link>

					<Navbar.Item hideIn="sm">
						<Button
							auto
							css={{
								backgroundColor: navtext,
								color: navbackground,
								boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
							}}
							flat
							as={Link}
							href="/sign-up">
							Sign Up
						</Button>
					</Navbar.Item>
				</Navbar.Content>
				<Navbar.Collapse>
					<Navbar.CollapseItem disabled>
						<Link
							color="inherit"
							css={{
								minWidth: "100%",
							}}
							href="#">
							Experience
						</Link>
					</Navbar.CollapseItem>
					<Navbar.CollapseItem>
						<Link
							color="inherit"
							css={{
								minWidth: "100%",
							}}
							href="#">
							Conference
						</Link>
					</Navbar.CollapseItem>
					<Navbar.CollapseItem>
						<Link
							color="inherit"
							css={{
								minWidth: "100%",
							}}
							href="#">
							Enrolling
						</Link>
					</Navbar.CollapseItem>
					<Navbar.CollapseItem>
						<Link
							color="inherit"
							css={{
								minWidth: "100%",
							}}
							href="#">
							App
						</Link>
					</Navbar.CollapseItem>
					<Navbar.CollapseItem>
						<Link
							color="inherit"
							css={{
								minWidth: "100%",
							}}
							href="#">
							Contact
						</Link>
					</Navbar.CollapseItem>
					<Navbar.CollapseItem>
						<Link
							color="inherit"
							css={{
								minWidth: "100%",
							}}
							href="/shop">
							Shop
						</Link>
					</Navbar.CollapseItem>
					<Navbar.CollapseItem>
						<Button
							auto
							css={{
								backgroundColor: "#307AB7",
								color: "white",
							}}
							flat
							as={Link}
							href="/login">
							Login
						</Button>
					</Navbar.CollapseItem>
				</Navbar.Collapse>
			</Navbar>
		</Fragment>
	);
}

export default Navigation;
