import { Grid, Image, Spacer, Text, User } from "@nextui-org/react";
import style from "./user.module.css";

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function UserPage(props) {
	console.log(props);
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
					{props.props.name + " " + props.props.surname}
				</Text>{" "}
				<Text
					h3
					color="gray"
					css={{ margin: "0" }}>
					{props.props.role || "User" + " • " + "@" + props.props.username}
				</Text>
				<div></div>
			</div>
			<div></div>
		</div>
	);
}

export async function getServerSideProps(context) {}
