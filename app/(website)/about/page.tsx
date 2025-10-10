import { Topbar } from "../server-components";
/* import { unstable_cacheLife as cacheLife } from "next/cache";
 */ import EsDronePic from "@/public/placeholders/the-english-school-1.jpg";
import PlenaryFlags from "@/public/assets/images/plenary-flags.jpg";
import PlenaryDelegatesStanding from "@/public/assets/images/plenary-delegates-standing.jpg";
import DelegatesDuringBreak from "@/public/assets/images/delegates-during-break.jpg";

import Image from "next/image";
import dynamic from "next/dynamic";

export const metadata = {
  title: "About Us",
  description:
    "Mediterranean Model United Nations, also known as MEDIMUN, is a simulated United Nations experience specifically designed for teenagers between the ages of 15 and 19. During this event, students take on the roles of delegates representing various UN Member States that are assigned to them. They engage in in-depth research on their assigned country's policies and use this knowledge to discuss, create, and debate resolutions. These resolutions are detailed documents that outline their suggestions and solutions to global issues, forming the foundation for multifaceted debates and constructive discussions on diverse topics.",
}; //FIXME: Add metadata to the page

export const experimental_ppr = true;

const CanvasRevealEffectThree = dynamic(() =>
  import("./_components/canvas-reveal-three").then((mod) => mod.CanvasRevealEffectThree),
);

export default async function AboutPage() {
  /* 	"use cache";
	cacheLife("max"); */

  return (
    <>
      <Topbar
        title="About Us"
        description="Mediterranean Model United Nations, also known as MEDIMUN, is a simulated United Nations experience specifically designed for teenagers between the ages of 15 and 19. During this event, students take on the roles of delegates representing various UN Member States that are assigned to them. They engage in in-depth research on their assigned country's policies and use this knowledge to discuss, create, and debate resolutions. These resolutions are detailed documents that outline their suggestions and solutions to global issues, forming the foundation for multifaceted debates and constructive discussions on diverse topics."
      />
      <CanvasRevealEffectThree />
      <div className="overflow-hidden pb-32 font-[Gilroy] text-white sm:mt-40">
        <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:mx-0 lg:min-w-full lg:max-w-none lg:flex-none lg:gap-y-8">
            <div className="lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8">
              <p className="mt-6 text-xl/8 text-gray-100">
                Mediterranean Model United Nations holds the distinction of being the largest and oldest Model United
                Nations conference in Cyprus. It is organized and operated on a non-profit basis by student and teacher
                volunteers who dedicate their time and efforts to its success.
              </p>
            </div>
            <div className="flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents">
              <div className="w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-end">
                <Image
                  loading="eager"
                  decoding="async"
                  quality={65}
                  alt="Delegates standing up at the end of the plenary session."
                  src={PlenaryDelegatesStanding}
                  className="aspect-7/5 w-148 max-w-none rounded-2xl bg-gray-50 object-cover"
                />
              </div>
              <div className="lg:w-148 contents lg:col-span-2 lg:col-end-2 lg:ml-auto lg:flex lg:items-start lg:justify-end lg:gap-x-8">
                <div className="order-first flex w-64 flex-none justify-end self-end lg:w-auto">
                  <Image
                    loading="eager"
                    decoding="async"
                    quality={65}
                    alt="Delegates enjoying a break during the conference workshop."
                    src={DelegatesDuringBreak}
                    className="aspect-4/3 w-[24rem] max-w-none flex-none rounded-2xl bg-gray-50 object-cover"
                  />
                </div>
                <div className="flex w-96 flex-auto justify-end lg:w-auto lg:flex-none">
                  <Image
                    loading="eager"
                    decoding="async"
                    quality={65}
                    alt="500 Delegates seating in the plenary session during the flag ceremony."
                    src={PlenaryFlags}
                    className="aspect-7/5 w-148 max-w-none flex-none rounded-2xl bg-gray-50 object-cover"
                  />
                </div>
                <div className="hidden sm:block sm:w-0 sm:flex-auto lg:w-auto lg:flex-none">
                  <Image
                    loading="eager"
                    decoding="async"
                    quality={65}
                    alt="Delegates indoors lifting their placards"
                    src={EsDronePic}
                    className="aspect-4/3 w-[24rem] max-w-none rounded-2xl bg-gray-50 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
