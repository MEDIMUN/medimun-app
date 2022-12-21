import { Grid, Image, Spacer, Text, User } from "@nextui-org/react";
import style from "./user.module.css";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function UserPage(props) {
	const currentroles = props.props.currentroles;
	const pastroles = props.props.pastroles;

	return (
		<div className={style.page}>
			<div className={style.nameholder}>
				<div>
					<Image
						className={style.pfp}
						src="https://avatars.githubusercontent.com/u/90158764?v=4"
					/>
				</div>
				<Text
					color="#278CFF"
					css={{ margin: "0" }}
					h2>
					{props.props.userinfo.name + " " + props.props.userinfo.surname}
				</Text>
				<Text
					h3
					color="gray"
					css={{ margin: "0" }}>
					{props.props.userinfo.school}
				</Text>
			</div>
			<Spacer y={8} />
			<div>
				{currentroles.map((role) => {
					return (
						<div>
							<Text
								h4
								color="gray"
								css={{ margin: "0" }}>
								{role.role}
							</Text>
							<Text
								h5
								color="gray"
								css={{ margin: "0" }}>
								{role.primary}
							</Text>
							<Text
								h6
								color="gray"
								css={{ margin: "0" }}>
								{role.session}
							</Text>
							<Spacer y={1} />
						</div>
					);
				})}
			</div>
		</div>
	);
}

export async function getServerSideProps(context) {}
