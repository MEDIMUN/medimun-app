import { TextGenerateEffect } from "./_components/text-generate-effect";
import { Topbar } from "../../server-components";
import { unstable_cacheLife as cacheLife } from "next/cache";
import type { Metadata } from "next";

export const experimental_ppr = true;

export const metadata: Metadata = {
	title: "Our Mission",
	description: "Explaining our mission of building a better future for everyone.",
	keywords: "MUN, Model United Nations, Debate, Mission Statement, Cyprus, Nicosia, Mediterranean, MEDIMUN",
	openGraph: {
		title: "Our Mission - MEDIMUN",
		description: "Explaining our mission of building a better future for everyone.",
		images: [{ url: "/assets/images/plenary-delegates-standing.jpg" }],
	},
};

export default async function Example() {
	"use cache";
	cacheLife("minutes");

	const words =
		"MEDIMUN is committed to fostering global awareness, critical thinking, and diplomacy among young leaders. Through rigorous debate, collaboration, and research, we provide a platform for students to engage with pressing international issues, develop public speaking and negotiation skills, and cultivate a spirit of cooperation. By simulating the workings of the United Nations, we encourage delegates to analyze complex global challenges, think critically about solutions, and appreciate diverse perspectives. Our conference promotes leadership, teamwork, and the ability to navigate diplomatic discourse with confidence and integrity. MEDIMUN aims to inspire and empower the next generation of change-makers, equipping them with the tools to engage in meaningful dialogue, advocate for global justice, and contribute to a more peaceful and sustainable future";

	return (
		<div className="w-full dark">
			<Topbar title={"Mission Statement"} description={"Explaining our mission of building a better future for everyone."} />
			<div className="relative isolate z-100 bg-black">
				<div aria-hidden="true" className="absolute left-1/2 right-0 top-0 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48">
					<div
						style={{
							clipPath:
								"polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)",
						}}
						className="aspect-801/1036 w-200.25 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
					/>
				</div>
				<div className="overflow-hidden">
					<div className="mx-auto max-w-7xl px-6 pb-32 lg:px-8">
						<div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
							<div className="relative w-full lg:max-w-xl lg:shrink-0 xl:max-w-2xl">
								<TextGenerateEffect words={words} className="max-w-7xl mx-auto font-[Gilroy] font-thin!" />
							</div>
							<div className="mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
								<div className="ml-auto w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36 xl:order-0 xl:pt-80">
									<div className="relative">
										<img
											alt=""
											src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=528&q=80"
											className="aspect-2/3 w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
										/>
										<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
									</div>
								</div>
								<div className="mr-auto w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36">
									<div className="relative">
										<img
											alt=""
											src="https://images.unsplash.com/photo-1485217988980-11786ced9454?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=528&q=80"
											className="aspect-2/3 w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
										/>
										<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
									</div>
									<div className="relative">
										<img
											alt=""
											src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=focalpoint&fp-x=.4&w=396&h=528&q=80"
											className="aspect-2/3 w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
										/>
										<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
									</div>
								</div>
								<div className="w-44 flex-none space-y-8 pt-32 sm:pt-0">
									<div className="relative">
										<img
											alt=""
											src="https://images.unsplash.com/photo-1670272504528-790c24957dda?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=left&w=400&h=528&q=80"
											className="aspect-2/3 w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
										/>
										<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
									</div>
									<div className="relative">
										<img
											alt=""
											src="https://images.unsplash.com/photo-1670272505284-8faba1c31f7d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=528&q=80"
											className="aspect-2/3 w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
										/>
										<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
