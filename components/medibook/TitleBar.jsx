import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { s, authorize } from "@/lib/authorize";
import { Button, ButtonGroup } from "@nextui-org/react";
import Link from "next/link";

export function e() {
	return s;
}

const buttonStyle = "bg-black text-white min-w-max hover:bg-gray-600 duration-200 w-full";

export async function TitleBar(params) {
	const session = await getServerSession(authOptions);
	if (!params?.title) return;
	return (
		<div className={`px-auto m-2 flex justify-center rounded-xl border-none py-4 align-middle font-[Montserrat] duration-300 [-box-shadow:_rgba(0,_0,_0,_0.35)_0px_5px_5px] md:m-0 md:rounded-none md:border-y-[1px] md:py-6 ${("bg-gradient-to-r from-gray-700 via-gray-900 to-black" && false) || "border-gray-200 bg-gray-100 "}`}>
			<div className="flex w-full max-w-[1248px] flex-col justify-between overflow-y-auto px-6 md:flex-row">
				<div className="text-black">
					<h1 className={`${params.titleStyle} text-3xl font-semibold`}>{params?.title}</h1>
					{params.description && <h2 className={`text-sm font-light text-black`}>{params?.description}</h2>}
				</div>
				{(params.button1text || params.button2text) && (
					<div className="mt-3 flex flex-row gap-2 md:mt-0">
						{params.button1text && params.button1href && session && (authorize(session, [params.button1roles]) || params.button1show) && (
							<Button as={Link} href={params?.button1href} className={`${buttonStyle} `}>
								{params?.button1text}
							</Button>
						)}
						{params.button1text && !params.button1href && session && authorize(session, [params.button1roles] || params.button1show) && (
							<form className="my-auto w-full" action={params.button1action}>
								<Button className={`${buttonStyle} `}>{params?.button1text}</Button>
							</form>
						)}
						{params?.button2text && params.button2href && session && authorize(session, [params.button2roles] || params.button2show) && (
							<Button href={params?.button2href} as={Link} className={`${buttonStyle} `}>
								{params?.button2text}
							</Button>
						)}
						{params.button2text && !params.button2href && session && authorize(session, [params.button2roles] || params.button2show) && (
							<form className="my-auto w-full" action={params.button2action}>
								<Button className={`${buttonStyle} `}>{params?.button2text}</Button>
							</form>
						)}
					</div>
				)}
			</div>
			{/* 			<div className="h-12 w-full bg-gradient-to-b from-[rgba(255,255,255,0)] to-white pt-4"></div>
			 */}{" "}
		</div>
	);
}
