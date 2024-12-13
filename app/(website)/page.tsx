import prisma from "@/prisma/client";
import HeroImage from "./hero-image";
import { ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/16/solid";
import Link from "next/link";
import { getOrdinal } from "@/lib/get-ordinal";
import Image from "next/image";
import { notFound } from "next/navigation";
import { JSX } from "react";

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

const benefits = ["7 - 9 Feb 2025", "7 Committees", "500 Delegates", "100s of Volunteers"];

export async function HomePage() {
	const currentSession = await prisma.session
		.findFirstOrThrow({
			where: { isMainShown: true },
			include: {
				Day: { include: { location: true } },
				Resource: {
					where: { scope: { hasSome: ["SESSIONPROSPECTUS"] } },
					take: 1,
				},
			},
		})
		.catch(notFound);

	const features = [
		{
			name: "Messaging",
			description: "Send messages to other delegates, chairs, and secretariat members.",
			icon: ArrowRightIcon,
		},
		{
			name: "Resolutions",
			description: "Create and submit resolutions for your committee.",
			icon: ArrowRightIcon,
		},
		{
			name: "Debate",
			description: "Submit your vote digitally for a whole new debate experience.",
			icon: ArrowRightIcon,
		},
	];

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
			<div className="mb-10 font-[GilroyLight]">
				<div className="relative mt-32 sm:mt-40">
					<div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
						<div className="mx-auto flex max-w-2xl flex-col gap-16 bg-primary/20 px-6 py-16 ring-1 ring-black/10 sm:rounded-3xl sm:p-8 lg:mx-0 lg:max-w-none lg:flex-row lg:items-center lg:py-20 xl:gap-x-20 xl:px-20">
							{currentSession?.cover ? (
								<div
									style={{
										backgroundImage: `url(/api/sessions/${currentSession.id}/cover)`,
									}}
									className="!relative flex h-96 w-full flex-none rounded-2xl bg-opacity-35 bg-cover object-cover shadow-xl lg:aspect-square lg:h-auto lg:max-w-sm"></div>
							) : (
								<div
									style={{
										backgroundImage: `url(/pages/index/dabbing.jpg)`,
									}}
									className="!relative flex h-96 w-full flex-none rounded-2xl bg-opacity-35 bg-cover object-cover shadow-xl lg:aspect-square lg:h-auto lg:max-w-sm">
									<p className="-font-[canela] my-auto w-full translate-y-[15px] bg-[url(/assets/gradients/1.jpg)] bg-cover bg-clip-text text-center text-[12rem] !font-[900] text-transparent">
										20
									</p>
								</div>
							)}
							<div className="w-full flex-auto">
								<h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
									The {currentSession.number}
									<sup>{getOrdinal(currentSession.numberInteger)}</sup> Annual Session
								</h2>
								{currentSession.welcomeText && <p className="mt-6 text-lg leading-8 text-gray-700">{currentSession.welcomeText}</p>}
								<ul role="list" className="mt-10 grid grid-cols-1 gap-x-8 gap-y-3 text-base leading-7 text-black sm:grid-cols-2">
									{benefits.map((benefit) => (
										<li key={benefit} className="flex gap-x-3">
											<CheckCircleIcon aria-hidden="true" className="h-7 w-5 flex-none" />
											{benefit}
										</li>
									))}
								</ul>
								<div className="mt-10 flex">
									<Link href="/sessions/20" className="text-sm font-semibold leading-6 text-primary">
										Explore the Session <span aria-hidden="true">&rarr;</span>
									</Link>
								</div>
							</div>
						</div>
					</div>
					<div aria-hidden="true" className="absolute inset-x-0 -top-16 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl">
						<div
							style={{
								clipPath:
									"polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
							}}
							className="aspect-[1318/752] w-[82.375rem] flex-none bg-gradient-to-r from-primary to-[#4f46e5] opacity-25"
						/>
					</div>
				</div>
			</div>
			<div className="mt-32 overflow-hidden font-[GilroyLight] sm:mt-40">
				<div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
					<div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:mx-0 lg:min-w-full lg:max-w-none lg:flex-none lg:gap-y-8">
						<div className="lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8">
							<h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our people</h2>
							<p className="mt-6 text-xl leading-8 text-gray-600">
								Mediterranean Model United Nations, the largest and oldest THIMUN-affiliated MUN conference in the Mediterranean region, is a
								simulation of the United Nations for high school students.{" "}
							</p>
							{/* <p className="mt-6 text-base leading-7 text-gray-600">
								
							</p> */}
						</div>
						<div className="flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents">
							<div className="w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-end">
								<Image
									width={1000}
									height={1000}
									quality={50}
									alt="Delegates lined up"
									src="/placeholders/delegates-2.jpg"
									className="aspect-[7/5] w-[37rem] max-w-none rounded-2xl bg-gray-50 object-cover"
								/>
							</div>
							<div className="contents lg:col-span-2 lg:col-end-2 lg:ml-auto lg:flex lg:w-[37rem] lg:items-start lg:justify-end lg:gap-x-8">
								<div className="order-first flex w-64 flex-none justify-end self-end lg:w-auto">
									<Image
										width={1000}
										height={1000}
										quality={50}
										alt="Delegates lined up for the plenary session"
										src="/placeholders/delegates-3.jpg"
										className="aspect-[4/3] w-[24rem] max-w-none flex-none rounded-2xl bg-gray-50 object-cover"
									/>
								</div>
								<div className="flex w-96 flex-auto justify-end lg:w-auto lg:flex-none">
									<Image
										width={1000}
										height={1000}
										quality={50}
										alt="Delegates and the committee chairs in session"
										src="/placeholders/delegates-and-chairs.JPG"
										className="aspect-[7/5] w-[37rem] max-w-none flex-none rounded-2xl bg-gray-50 object-cover"
									/>
								</div>
								<div className="hidden sm:block sm:w-0 sm:flex-auto lg:w-auto lg:flex-none">
									<Image
										width={1000}
										height={1000}
										quality={50}
										alt="Delegates indoors lifting their placards"
										src="/assets/delegates-indoors.jpg"
										className="aspect-[4/3] w-[24rem] max-w-none rounded-2xl bg-gray-50 object-cover"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="overflow-hidden py-24 font-[GilroyLight] sm:py-32">
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
						<div className="lg:pr-8 lg:pt-4">
							<div className="lg:max-w-lg">
								<h2 className="text-base font-semibold leading-7 text-gray-900">Introdoucing</h2>
								<p className="mt-2 font-[canela] text-3xl text-primary sm:text-4xl">MediBook</p>
								<p className="mt-6 text-lg leading-8 text-gray-600">
									Our brand-new state of the art platform for everything related to the conference.
								</p>
								<dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
									{features.map((feature) => (
										<div key={feature.name} className="relative pl-9">
											<dt className="inline font-semibold text-gray-900">
												<feature.icon aria-hidden="true" className="absolute left-1 top-1 h-5 w-5 text-primary" />
												{feature.name}
											</dt>{" "}
											<dd className="inline">{feature.description}</dd>
										</div>
									))}
								</dl>
							</div>
						</div>
						<Image
							alt="MediBook screenshot"
							src="/assets/app-preview.png"
							width={2432}
							height={1442}
							quality={60}
							className="w-[48rem] max-w-none rounded-2xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
						/>
					</div>
				</div>
			</div>
		</>
	);
}
