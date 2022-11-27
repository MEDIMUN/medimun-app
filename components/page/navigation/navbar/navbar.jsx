import { Fragment } from "react";

import style from "./navbar.module.css";

import { Dropdown, Navbar, Button, Link, Text, css, Spacer } from "@nextui-org/react";

import Logo from "../../../common/branding/logo/main";
import NavigationNotification from "../notice/notice";

function Navigation(props) {
	const collapseItems = ["Conference", "Customers", "Pricing", "Company", "Legal", "Team", "Help & Feedback", "Login", "Sign Up"];
	return (
		<Fragment>
			<NavigationNotification
				text={props.text || ""}
				link={props.link || ""}
			/>
			<Navbar
				className={style.navbar}
				css={{
					backgroundColor: "white",
					height: "60px",
					paddingBottom: "16px",
					opacity: "100%",
				}}
				maxWidth="md"
				variant="sticky">
				<Navbar.Toggle
					showIn="sm"
					css={{ paddingTop: "16px" }}
				/>
				<Navbar.Brand
					className={style.center}
					css={{ paddingTop: "24px" }}>
					<Logo
						color={"blue"}
						width={200}
						height={50}
						className={style.center}
					/>
				</Navbar.Brand>
				<Navbar.Content
					enableCursorHighlight
					variant="underline"
					hideIn="sm"
					css={{ marginTop: "16px" }}>
					<Navbar.Link
						variant="underline"
						css={{ color: "#307AB7" }}
						href="/">
						Experience
					</Navbar.Link>

					<Navbar.Link
						variant="underline"
						css={{ color: "#307AB7" }}
						href="/">
						Conference
					</Navbar.Link>
					<Navbar.Link
						variant="underline"
						css={{ color: "#307AB7" }}
						href="/">
						Enrolling
					</Navbar.Link>
					<Navbar.Link
						variant="underline"
						css={{ color: "#307AB7" }}
						href="/">
						App
					</Navbar.Link>
					<Navbar.Link
						variant="underline"
						css={{ color: "#307AB7" }}
						href="/">
						Contact
					</Navbar.Link>
				</Navbar.Content>
				<Navbar.Content css={{ paddingTop: "16px" }}>
					<Navbar.Link
						variant="underline"
						css={{ color: "#307AB7" }}
						href="/login"
						hideIn="sm">
						Login
					</Navbar.Link>

					<Navbar.Item>
						<Button
							auto
							css={{
								backgroundColor: "#307AB7",
								color: "white",
								boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
							}}
							flat
							as={Link}
							href="/sign-up">
							Sign Up
						</Button>
					</Navbar.Item>
				</Navbar.Content>
				<Navbar.Collapse css={{ marginTop: "-16px" }}>
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
