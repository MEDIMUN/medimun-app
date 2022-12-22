import { Grid, Image, Spacer, User, Text as TextN } from "@nextui-org/react";
import style from "./user.module.css";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";

export default function UserPage(props) {
	const currentroles = props.props.currentroles;
	const pastroles = props.props.pastroles;

	return (
		<div className={style.page}>
			<div className={style.nameholder}>
				<div className={style.picture}>
					<Image
						className={style.pfp}
						src="https://avatars.githubusercontent.com/u/90158764?v=4"
					/>
					<div className={style.names}>
						<TextN
							h6
							color="#278CFF"
							css={{ margin: "0", fontSize: "2rem", fontWeight: "bold" }}>
							{props.props.userinfo.name + " " + props.props.userinfo.surname}
						</TextN>
						<TextN
							h6
							color="gray"
							css={{ margin: "0", fontWeight: "500" }}>
							{props.props.userinfo.school}
						</TextN>
					</div>
				</div>
			</div>
			<Spacer y={8} />
			<div>
				<Tabs variant="soft-rounded">
					<TabList css={{ paddingLeft: "20px" }}>
						<Tab>Current Roles</Tab>
						<Tab>Past Roles</Tab>
						<Tab>About Me</Tab>
					</TabList>
					<TabPanels>
						<TabPanel>
							<div className={style.rolestab}>
								{currentroles.map((role) => {
									return (
										<div>
											<div className={style.pastRoles}>
												<TextN
													className={style.rolename}
													css={{ fontSize: "1.2rem", fontWeight: "$bold" }}>
													{role.role}
												</TextN>
												<TextN className={style.roleSession}>CURRENT</TextN>
											</div>
											<Spacer y={0.1} />
										</div>
									);
								})}
								<Spacer y={1} />
							</div>
						</TabPanel>
						<TabPanel>
							<div className={style.rolestab}>
								{pastroles.map((role) => {
									return (
										<div>
											<div className={style.pastRoles}>
												<TextN
													className={style.rolename}
													css={{ fontSize: "1.2rem", fontWeight: "$bold" }}>
													{role.role}
												</TextN>
												<TextN className={style.pastRoleSession}>{role.session}</TextN>
											</div>
											<Spacer y={0.1} />
										</div>
									);
								})}
								<Spacer y={1} />
							</div>
						</TabPanel>
						<TabPanel>
							<div className={style.bioSection}>
								<p>No biography added yet, this feature is exxperimental, biographies may take time to appear or not appear at all.</p>
							</div>
						</TabPanel>
					</TabPanels>
				</Tabs>
			</div>
		</div>
	);
}
