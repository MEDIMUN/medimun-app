import style from "./index.module.css";
import Logo from "@logo";
import { Spacer, Text } from "@nextui-org/react";

export default function Landscape() {
	return (
		<div className={style.landscape}>
			<Logo className={style.logo} color={"white"} width={200} height={50} />
			<Spacer y={2} />
			<Text weight="medium">Please rotate your device. </Text>
			<Spacer y={2} />
			<Text weight="light">Landscape mode is not supported.</Text>
		</div>
	);
}
