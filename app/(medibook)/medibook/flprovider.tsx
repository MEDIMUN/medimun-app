import Image from "next/image";
import Rose from "@/public/assets/the-rose.png";

import { auth } from "@/auth";

const onlyIds = ["100000000001", "111111111111"];

export async function TopFl() {
	const authSession = await auth();
	if (!authSession) return;
	if (!onlyIds.includes(authSession?.user?.id)) return;
	return (
		<div className="absolute bottom-2 right-2 w-[0px] select-none opacity-50 duration-150 hover:opacity-0 dark:opacity-55 md:w-[0px]">
			<Image src={Rose} alt="Flower for..." className="select-none" />
		</div>
	);
}

export default TopFl;
