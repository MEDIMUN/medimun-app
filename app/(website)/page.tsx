import prisma from "@/prisma/client";
import HeroImage from "./hero-image";

export const metadata = {
	title: {
		absolute: "Mediterranean Model United Nations • MEDIMUN",
	},
	description:
		"Mediterranean Model United Nations, the largest and oldest THIMUN-affiliated MUN conference in the Mediterranean region, is a simulation of the United Nations for high school students.",
};

export default async function Page(): Promise<JSX.Element> {
	return <HomePage />;
}

export const revalidate = 120;

export async function HomePage(): Promise<JSX.Element> {
	const currentSession = await prisma.session.findFirst({
		where: { isMainShown: true },
		select: { theme: true, subTheme: true },
	});

	return (
		<>
			<section className="-bg-gradient-to-r h-svh from-transparent to-neutral-900/5">
				<svg
					className="absolute inset-x-0 top-0 -z-10 h-[64rem] w-full stroke-gray-200 [mask-image:radial-gradient(32rem_32rem_at_center,white,transparent)]"
					aria-hidden="true">
					<defs>
						<pattern id="1f932ae7-37de-4c0a-a8b0-a6e3b4d44b84" width={200} height={200} x="50%" y={-1} patternUnits="userSpaceOnUse">
							<path d="M.5 200V.5H200" fill="none" />
						</pattern>
					</defs>
					<svg x="50%" y={-1} className="overflow-visible fill-gray-50">
						<path d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z" strokeWidth={0} />
					</svg>
					<rect width="100%" height="100%" strokeWidth={0} fill="url(#1f932ae7-37de-4c0a-a8b0-a6e3b4d44b84)" />
				</svg>
				<HeroImage />
				<div className="absolute mx-auto mt-[20svh] flex w-full flex-col md:mt-[35vh]">
					<div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 text-left text-primary md:gap-2 md:text-center">
						{currentSession?.theme && <h1 className="font-[canela] text-5xl !leading-[50px] md:text-6xl">{currentSession.theme}</h1>}
						{currentSession?.subTheme && <h2 className="font-[LondiniaMedium] text-4xl text-zinc-800">{currentSession.subTheme}</h2>}
					</div>
				</div>
			</section>
			{/* <section className="min-h-svh">
				<div className="flex p-8 md:p-16">
					<div className="mx-auto h-full min-h-[300px] w-full max-w-7xl rounded-2xl bg-gradient-to-tr from-primary to-red-500">...</div>
				</div>
			</section> */}
		</>
	);
}
