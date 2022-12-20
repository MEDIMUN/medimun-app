import style from "./index.module.css";
import Logo from "../../../components/common/branding/logo/main";
import { Spacer, Text } from "@nextui-org/react";

export default function Landscape() {
	return (
		<div className={style.landscape}>
			<Logo
				className={style.logo}
				color={"white"}
				width={200}
				height={50}
			/>
			<Spacer y={2} />
			<Text weight="medium">Please rotate your device. </Text>
			<Spacer y={2} />
			<Text weight="light">This site does not support landscape mode on small mobile devices.</Text>
		</div>
	);
}
