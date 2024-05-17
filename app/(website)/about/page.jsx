import Image from "next/image";
import image1 from "@/public/placeholders/the-english-school-1.jpg";
import image2 from "@/public/placeholders/the-english-school-2.jpg";

export const metadata = {
	title: "About",
	description: "Learn more about MEDIMUN",
};

export default function Page() {
	return (
		<div className="-bg-[url(/assets/delegates-indoors-2.jpg)] px h-auto min-h-screen w-full bg-primary  bg-gradient-to-r from-gray-700 via-gray-900 to-black bg-cover font-[Montserrat] text-xl font-[700] text-white">
			<div className="mx-auto flex h-auto min-h-screen w-full max-w-[1200px] flex-col gap-10 p-4 pt-[96px]">
				<section>
					<h1 className="ml-4 select-none rounded-3xl font-[Montserrat] text-[35px] font-[700] text-white">About MEDIMUN</h1>
					<h2 className="ml-4 mt-2 select-none rounded-3xl font-[Montserrat] text-[20px] font-[300] text-white">The Mediterranean Model United Nations</h2>
					<p className="h-auto bg-opacity-50 p-4 text-sm md:text-lg">
						As a conference accredited by THIMUN Foundation, the Mediterranean Model United Nations (MEDIMUN) holds a venerable status, duly recognized by the governing institution that endorses Model United Nations conferences globally. MEDIMUN was established in the year 2006 under the auspices of The English School and has since served as an educational platform of considerable repute. It enables young scholars to deepen their understanding not merely of specific nation-states, but also of the intricate operations of the United Nations through immersive, experiential learning. These academic pursuits are facilitated and scrupulously overseen by esteemed Directors, who are commonly
						educators affiliated with the students' respective educational institutions. These Directors bear the weighty responsibility of instructing the delegates in the nuances of the United Nations' formal 'Parliamentary Procedures.' This stewardship ensures that the debates and deliberations are conducted within a framework that is both structured and professionally dignified. Further amplifying its significance, MEDIMUN enjoys the distinction of being the most expansive and longest-running Model United Nations conference in Cyprus. Administered under the aegis of a non-profit organizational structure, the conference is orchestrated by a dedicated cadre of both student and educator
						volunteers. These individuals altruistically invest their time and intellectual resources to guarantee the event's continued success and scholarly impact.
					</p>
				</section>
				<section>
					<h2 className="ml-4 select-none rounded-3xl font-[Montserrat] text-[35px] font-[700] text-white">The English School</h2>
					<h3 className="ml-4 mt-2 select-none rounded-3xl font-[Montserrat] text-[20px] font-[300] text-white">The Creators of MEDIMUN</h3>
					<p className="h-auto bg-opacity-50 p-4 text-sm md:text-lg">Founded in 1900 by Canon Frank Darvall Newham, The English School is a co-educational, fee-paying day institution primarily attended by Cypriot youth. The school's mission is to foster academic excellence through rigorous and high-caliber teaching and learning processes. Its educational paradigm is designed to unlock individual potential by delivering rich, intellectually stimulating experiences and challenges. These are facilitated by a cadre of highly skilled and trained educators within a secure, nurturing environment, employing state-of-the-art pedagogical techniques and contemporary technologies.</p>
					<div className="my-8 flex flex-col gap-4  rounded-lg md:max-w-[350px] md:flex-row">
						<Image className="rounded-md object-cover" src={image1} />
						<Image className="rounded-md object-cover" src={image2} />
					</div>
					<p className="h-auto bg-opacity-50 p-4 text-sm md:text-lg">
						The academic curriculum is structured around IGCSE and A Level qualifications, and the medium of instruction is exclusively in English. Admission to the institution at the age of 12 is fiercely competitive. The majority of graduates matriculate into universities belonging to the esteemed Russell Group, with a notable percentage securing placement at either Oxford, Cambridge, or esteemed medical schools. The school's head is an esteemed member of the United Kingdom Headmasters' Conference, underscoring the institution's adherence to traditional and academic cultural norms. The institutional motto, "Non sibi sed scholae," encapsulates the ethos of community-first, emphasizing that
						students should take pride in their membership within the school community and prioritize collective needs above individual desires.
					</p>
				</section>
			</div>
		</div>
	);
}
