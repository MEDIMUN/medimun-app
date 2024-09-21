import Image from "next/image";
import Rose from "@/public/assets/red-rose-bottom-right.png";

import { auth } from "@/auth";

const onlyIds = ["100000000001"];

export async function TopFl() {
	const authSession = await auth();
	if (!authSession) return;
	if (!onlyIds.includes(authSession?.user?.id)) return;
	return (
		<div className="absolute bottom-2 right-2 w-24 select-none opacity-60 duration-150 hover:opacity-0 dark:opacity-55 md:w-32">
			<Image src={Rose} alt="Fl" className="select-none" />
		</div>
	);
}

export default TopFl;
