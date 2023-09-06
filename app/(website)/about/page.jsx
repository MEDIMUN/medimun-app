"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import image1 from "@/public/placeholders/the-english-school-1.jpg";
import image2 from "@/public/placeholders/the-english-school-2.jpg";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Page() {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

	const updateMousePosition = (ev) => {
		setMousePosition({ x: ev.clientX, y: ev.clientY });
	};

	useEffect(() => {
		window.addEventListener("mousemove", updateMousePosition);
		return () => window.removeEventListener("mousemove", updateMousePosition);
	}, []);

	const vignette = {
		background: `radial-gradient(circle at center, #AE2D2890 0%, rgb(0, 0, 0) 95%, rgb(0, 0, 0) 100%)`,
	};

	const SummaryButton = () => {
		return (
			<div className="ml-4 mt-2 flex w-max items-center space-x-2 rounded-md bg-gray-500 p-2">
				<Switch checked={isSummary} onCheckedChange={(e) => setIsSummary(e)} id="summaryMode" />
				<Label className="text-lg" htmlFor="summaryMode">
					Summary mode
				</Label>
			</div>
		);
	};

	const highlightStyle = "duration-1000 bg-[var(--medired)] text-white py-1 hover:bg-black hover:cursor-none w-max";
	const highlightStyle2 = " duration-1000 bg-[#2D4698] text-white py-1 hover:bg-black hover:cursor-none";
	const [isSummary, setIsSummary] = useState(false);
	const normalStyle = "opacity-0";

	return (
		<div className="h-auto min-h-[100vh] w-full bg-[url(/placeholders/the-english-school-1.jpg)] bg-cover font-[Montserrat] text-xl font-[700] text-white">
			<div /* className="bg-gradient-to-r from-red-500 to-red-800" */ style={vignette}>
				<div className="mx-auto flex h-auto min-h-[100vh] w-full max-w-[1200px] flex-col gap-10 p-4 pt-[96px]">
					<section>
						<h1 className="ml-4 select-none rounded-3xl font-[Montserrat] text-[35px] font-[700] text-white">About MEDIMUN</h1>
						<h2 className="ml-4 mt-2 select-none rounded-3xl font-[Montserrat] text-[20px] font-[300] text-white">The Mediterranean Model United Nations</h2>
						<SummaryButton />
						<p className="h-auto bg-opacity-50 p-4 leading-9">
							<span className={`select-none border-black py-1 text-[var(--medired)] duration-1000 ${isSummary ? "max-w-full overflow-auto" : "bg-gray-200"}`}>
								<span className={`${isSummary && normalStyle}`}>As a conference </span>
								<span className={highlightStyle}>accredited by THIMUN Foundation</span>
								<span className={`${isSummary && normalStyle}`}>, the Mediterranean Model United Nations </span>
								<span className={highlightStyle}>(MEDIMUN)</span>
								<span className={`${isSummary && normalStyle}`}> holds a </span>
								<span className={highlightStyle}>venerable status</span>
								<span className={`${isSummary && normalStyle}`}>, duly recognized by the </span>
								<span className={highlightStyle}>governing institution</span>
								<span className={`${isSummary && normalStyle}`}> that endorses Model United Nations conferences </span>
								<span className={highlightStyle}>globally</span>
								<span className={`${isSummary && normalStyle}`}>.</span>
								<span className={`${isSummary && normalStyle}`}>MEDIMUN was </span>
								<span className={highlightStyle}>established in</span>
								<span className={`${isSummary && normalStyle}`}> the year</span>
								<span className={highlightStyle}>2006</span>
								<span className={`${isSummary && normalStyle}`}> under the </span>
								<span className={highlightStyle}>auspices</span>
								<span className={`${isSummary && normalStyle}`}> of The English School and has since served as an </span>
								<span className={highlightStyle}>educational platform</span>
								<span className={`${isSummary && normalStyle}`}> of considerable repute. It enables </span>
								<span className={highlightStyle}>young scholars</span>
								<span className={`${isSummary && normalStyle}`}> to deepen their understanding not merely of </span>
								<span className={highlightStyle}>specific nation-states</span>
								<span className={`${isSummary && normalStyle}`}>, but also of the </span>
								<span className={highlightStyle}>intricate operations</span>
								<span className={`${isSummary && normalStyle}`}> of the United Nations through </span>
								<span className={highlightStyle}>immersive</span>
								<span className={`${isSummary && normalStyle}`}>, experiential learning.</span>
								<span className={`${isSummary && normalStyle}`}>These academic pursuits are </span>
								<span className={highlightStyle}>facilitated</span>
								<span className={`${isSummary && normalStyle}`}> and scrupulously </span>
								<span className={highlightStyle}>overseen</span>
								<span className={`${isSummary && normalStyle}`}> by esteemed Directors, who are commonly </span>
								<span className={highlightStyle}>educators</span>
								<span className={`${isSummary && normalStyle}`}>affiliated with the students' respective </span>
								<span className={highlightStyle}>educational institutions</span>
								<span className={`${isSummary && normalStyle}`}>. These Directors bear the </span>
								<span className={highlightStyle}>weighty responsibility</span>
								<span className={`${isSummary && normalStyle}`}> of instructing the delegates in the </span>
								<span className={highlightStyle}>nuances</span>
								<span className={`${isSummary && normalStyle}`}> of the United Nations' formal '</span>
								<span className={highlightStyle}>Parliamentary Procedures</span>
								<span className={`${isSummary && normalStyle}`}>.' This stewardship ensures that the debates and deliberations are conducted within a </span>
								<span className={highlightStyle}>framework</span>
								<span className={`${isSummary && normalStyle}`}> that is both</span>
								<span className={highlightStyle}>structured</span>
								<span className={`${isSummary && normalStyle}`}> and </span>
								<span className={highlightStyle}>professionally dignified</span>
								<span className={`${isSummary && normalStyle}`}>. Further amplifying its </span>
								<span className={highlightStyle}>significance</span>
								<span className={`${isSummary && normalStyle}`}>, MEDIMUN enjoys the </span>
								<span className={highlightStyle}>distinction</span>
								<span className={`${isSummary && normalStyle}`}> of being the most </span>
								<span className={highlightStyle}>expansive</span>
								<span className={`${isSummary && normalStyle}`}> and </span>
								<span className={highlightStyle}>longest-running</span>
								<span className={`${isSummary && normalStyle}`}> Model United Nations conference in the Republic of Cyprus. Administered under the </span>
								<span className={highlightStyle}>aegis</span>
								<span className={`${isSummary && normalStyle}`}> of a </span>
								<span className={highlightStyle}>non-profit</span>
								<span className={`${isSummary && normalStyle}`}> organizational structure, the conference is </span>
								<span className={highlightStyle}>orchestrated</span>
								<span className={`${isSummary && normalStyle}`}> by a dedicated cadre of both </span>
								<span className={highlightStyle}>student</span>
								<span className={`${isSummary && normalStyle}`}> and </span>
								<span className={highlightStyle}>educator volunteers</span>
								<span className={`${isSummary && normalStyle}`}>. These individuals </span>
								<span className={highlightStyle}>altruistically invest</span>
								<span className={`${isSummary && normalStyle}`}> their time and </span>
								<span className={highlightStyle}>intellectual resources</span>
								<span className={`${isSummary && normalStyle}`}> to guarantee the event's</span>
								<span className={highlightStyle}>continued success</span>
								<span className={`${isSummary && normalStyle}`}> and </span>
								<span className={highlightStyle}>scholarly impact</span>
								<span className={`${isSummary && normalStyle}`}>.</span>
							</span>
						</p>
					</section>
					<section>
						<h2 className="ml-4 select-none rounded-3xl font-[Montserrat] text-[35px] font-[700] text-white">The English School</h2>
						<h3 className="ml-4 mt-2 select-none rounded-3xl font-[Montserrat] text-[20px] font-[300] text-white">The Creators of MEDIMUN</h3>
						<SummaryButton />
						<div className="flex flex-col gap-4 rounded-lg p-4 md:max-w-[350px] md:flex-row">
							<Image src={image1} />
							<Image src={image2} />
						</div>
						<p className="h-auto bg-opacity-50 p-4 leading-9">
							<span className={`select-none py-1 text-gray-800 duration-1000 ${isSummary ? "max-w-full overflow-auto" : "bg-gray-200"}`}>
								<span className={`${isSummary && normalStyle}`}>Founded in </span>
								<span className={highlightStyle2}>1900</span>
								<span className={`${isSummary && normalStyle}`}> by Canon Frank Darvall Newham, The English School is a </span>
								<span className={highlightStyle2}>co-educational</span>
								<span className={`${isSummary && normalStyle}`}>, fee-paying day institution primarily </span>
								<span className={highlightStyle2}>attended by Cypriot youth.</span>
								<span className={`${isSummary && normalStyle}`}> The school's </span>
								<span className={highlightStyle2}>mission</span>
								<span className={`${isSummary && normalStyle}`}> is to foster </span>
								<span className={highlightStyle2}>academic excellence</span>
								<span className={`${isSummary && normalStyle}`}> through rigorous and high-caliber </span>
								<span className={highlightStyle2}>teaching and learning</span>
								<span className={`${isSummary && normalStyle}`}> processes. Its educational </span>
								<span className={highlightStyle2}>paradigm</span>
								<span className={`${isSummary && normalStyle}`}> is designed to unlock </span>
								<span className={highlightStyle2}>individual potential</span>
								<span className={`${isSummary && normalStyle}`}> by delivering rich, intellectually stimulating </span>
								<span className={highlightStyle2}>experiences</span>
								<span className={`${isSummary && normalStyle}`}> and </span>
								<span className={highlightStyle2}>challenges</span>
								<span className={`${isSummary && normalStyle}`}>. These are facilitated by a </span>
								<span className={highlightStyle2}>cadre</span>
								<span className={`${isSummary && normalStyle}`}> of highly skilled and </span>
								<span className={highlightStyle2}>trained educators</span>
								<span className={`${isSummary && normalStyle}`}> within a secure, </span>
								<span className={highlightStyle2}>nurturing environment</span>
								<span className={`${isSummary && normalStyle}`}>, employing </span>
								<span className={highlightStyle2}>state-of-the-art</span>
								<span className={`${isSummary && normalStyle}`}> pedagogical techniques and </span>
								<span className={highlightStyle2}>contemporary technologies</span>
								<span className={`${isSummary && normalStyle}`}>. The academic </span>
								<span className={highlightStyle2}>curriculum</span>
								<span className={`${isSummary && normalStyle}`}> is structured around </span>
								<span className={highlightStyle2}>IGCSE</span>
								<span className={`${isSummary && normalStyle}`}> and </span>
								<span className={highlightStyle2}>A Level</span>
								<span className={`${isSummary && normalStyle}`}> qualifications, and the medium of </span>
								<span className={highlightStyle2}>instruction</span>
								<span className={`${isSummary && normalStyle}`}> is exclusively in </span>
								<span className={highlightStyle2}>English</span>
								<span className={`${isSummary && normalStyle}`}>. Admission to the institution at the age of </span>
								<span className={highlightStyle2}>12</span>
								<span className={`${isSummary && normalStyle}`}> is fiercely </span>
								<span className={highlightStyle2}>competitive</span>
								<span className={`${isSummary && normalStyle}`}>. The majority of </span>
								<span className={highlightStyle2}>graduates</span>
								<span className={`${isSummary && normalStyle}`}> matriculate into universities belonging to the esteemed </span>
								<span className={highlightStyle2}>Russell Group</span>
								<span className={`${isSummary && normalStyle}`}>, with a notable </span>
								<span className={highlightStyle2}>percentage</span>
								<span className={`${isSummary && normalStyle}`}> securing placement at either </span>
								<span className={highlightStyle2}>Oxford, Cambridge</span>
								<span className={`${isSummary && normalStyle}`}>, or esteemed </span>
								<span className={highlightStyle2}>medical schools</span>
								<span className={`${isSummary && normalStyle}`}>. The school's head is an esteemed member of the </span>
								<span className={highlightStyle2}>United Kingdom Headmasters' Conference</span>
								<span className={`${isSummary && normalStyle}`}>, underscoring the institution's adherence to </span>
								<span className={highlightStyle2}>traditional</span>
								<span className={`${isSummary && normalStyle}`}> and </span>
								<span className={highlightStyle2}>academic</span>
								<span className={`${isSummary && normalStyle}`}> cultural norms. The institutional </span>
								<span className={highlightStyle2}>motto</span>
								<span className={`${isSummary && normalStyle}`}>, "</span>
								<span className={highlightStyle2}>Non sibi sed scholae</span>
								<span className={`${isSummary && normalStyle}`}>," encapsulates the ethos of </span>
								<span className={highlightStyle2}>community-first</span>
								<span className={`${isSummary && normalStyle}`}>, emphasizing that students should take </span>
								<span className={`${isSummary && normalStyle}`}>pride</span>
								<span className={`${isSummary && normalStyle}`}> in their membership within the school community and prioritize </span>
								<span className={highlightStyle2}>collective needs</span>
								<span className={`${isSummary && normalStyle}`}> above individual desires.</span>
							</span>
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
