import Logo from "../logos/main-logo";
import Sidebar from "../navigation/sidebar";
import style from "./dashboard-layout.module.css";
import { Dropdown, Navbar, Avatar, Button, Link, Text, css } from "@nextui-org/react";
import { Fragment } from "react";

export default function Layout(props) {
	return (
		<div className={style.borderFrame}>
			<Sidebar />

			<div className={style.content}>
				<div className={style.navbar}>
					<Navbar
						className={style.navbar}
						isCompact
						css={{
							position: "absolute",
							backgroundColor: "white",
							borderRadius: "5px 5px 0 0",
						}}
						color={"none"}
						maxWidth="xl"
						variant="">
						<Navbar.Content>
							<Navbar.Item>Next up: Lunch Break</Navbar.Item>
						</Navbar.Content>
						<Navbar.Content
							css={{
								"@xs": {
									w: "12%",
									jc: "flex-end",
								},
							}}>
							<Dropdown placement="bottom-right">
								<Navbar.Item>
									<Dropdown.Trigger>
										<Avatar
											bordered
											as="button"
											color="medimunBlue"
											size="md"
											src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
										/>
									</Dropdown.Trigger>
								</Navbar.Item>
								<Dropdown.Menu
									aria-label="User menu actions"
									color="secondary"
									onAction={(actionKey) => console.log({ actionKey })}>
									<Dropdown.Item
										key="profile"
										css={{ height: "$18" }}>
										<Text
											b
											color="inherit"
											css={{ d: "flex" }}>
											Signed in as
										</Text>
										<Text
											b
											color="inherit"
											css={{ d: "flex" }}>
											zoey@example.com
										</Text>
									</Dropdown.Item>
									<Dropdown.Item
										key="settings"
										withDivider>
										My Settings
									</Dropdown.Item>
									<Dropdown.Item key="team_settings">Team Settings</Dropdown.Item>
									<Dropdown.Item
										key="analytics"
										withDivider>
										Analytics
									</Dropdown.Item>
									<Dropdown.Item key="system">System</Dropdown.Item>
									<Dropdown.Item key="configurations">Configurations</Dropdown.Item>
									<Dropdown.Item
										key="help_and_feedback"
										withDivider>
										Help Feedback
									</Dropdown.Item>
									<Dropdown.Item
										key="logout"
										withDivider
										color="error">
										Log Out
									</Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>
						</Navbar.Content>
					</Navbar>
				</div>

				<main className={style.mainContent}>{props.children}</main>
			</div>
		</div>
	);
}
