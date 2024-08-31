import { Link } from "@nextui-org/link";
import { MDXRemote } from "next-mdx-remote/rsc";

export const metadata = {
	title: "About",
	description: "Learn more about MEDIMUN",
};

const about = `
## The Mediterranean Model United Nations
As a conference accredited by THIMUN Foundation, the Mediterranean Model United Nations (MEDIMUN) holds a venerable status, duly
recognized by the governing institution that endorses Model United Nations conferences globally. MEDIMUN was established in the year 2006
under the auspices of The English School and has since served as an educational platform of considerable repute. It enables young scholars
to deepen their understanding not merely of specific nation-states, but also of the intricate operations of the United Nations through
immersive, experiential learning. These academic pursuits are facilitated and scrupulously overseen by esteemed Directors, who are
commonly educators affiliated with the students' respective educational institutions. These Directors bear the weighty responsibility of
instructing the delegates in the nuances of the United Nations' formal 'Parliamentary Procedures.' This stewardship ensures that the
debates and deliberations are conducted within a framework that is both structured and professionally dignified. Further amplifying its
significance, MEDIMUN enjoys the distinction of being the most expansive and longest-running Model United Nations conference in Cyprus.
Administered under the aegis of a non-profit organizational structure, the conference is orchestrated by a dedicated cadre of both student
and educator volunteers. These individuals altruistically invest their time and intellectual resources to guarantee the event's continued
success and scholarly impact.

![The Mediterranean Model United Nations](/placeholders/delegates-2.jpg)

Explore all [sessions](/sessions).

## The English School
Founded in 1900 by Canon Frank Darvall Newham, The English School is a co-educational, fee-paying day institution primarily attended by
Cypriot youth. The school's mission is to foster academic excellence through rigorous and high-caliber teaching and learning processes.
Its educational paradigm is designed to unlock individual potential by delivering rich, intellectually stimulating experiences and
challenges. These are facilitated by a cadre of highly skilled and trained educators within a secure, nurturing environment, employing
state-of-the-art pedagogical techniques and contemporary technologies.

![The English School](/placeholders/the-english-school-1.jpg)

The academic curriculum is structured around IGCSE and A Level qualifications, and the medium of instruction is exclusively in English.
Admission to the institution at the age of 12 is fiercely competitive. The majority of graduates matriculate into universities belonging
to the esteemed Russell Group, with a notable percentage securing placement at either Oxford, Cambridge, or esteemed medical schools. The
school's head is an esteemed member of the United Kingdom Headmasters' Conference, underscoring the institution's adherence to traditional
and academic cultural norms. The institutional motto, "Non sibi sed scholae," encapsulates the ethos of community-first, emphasizing that
students should take pride in their membership within the school community and prioritize collective needs above individual desires.

![The English School](/placeholders/the-english-school-2.jpg)

Learn more at [The English School](https://englishschool.ac.cy/).

`;

export default async function Page() {
	return (
		<div className="mx-auto mb-96 max-w-[800px] bg-cover p-5 pt-20 font-[montserrat]">
			<div className="mb-20 mt-24">
				<h1 className="rounded-3xl text-center font-[Montserrat] text-4xl font-[700] text-content1-foreground md:text-5xl">About Us</h1>
			</div>
			<MDXRemote components={{ h1, h2, h3, h4, h5, h6, p, a, hr, li, ol, ul, img }} source={about} />
		</div>
	);
}

const h1 = (props) => {
	return <h1 className="font-md mb-3 select-none text-3xl tracking-tight text-red-700" {...props} />;
};

const h2 = (props) => {
	return <h2 className="font-md mb-3 text-2xl tracking-tight" {...props} />;
};

const h3 = (props) => {
	return <h3 className="font-md mb-3 text-xl tracking-tight" {...props} />;
};

const h4 = (props) => {
	return <h4 className="font-md mb-3 text-lg tracking-tight" {...props} />;
};

const h5 = (props) => {
	return <h5 className="font-md text-md mb-3 tracking-tight" {...props} />;
};

const h6 = (props) => {
	return <h6 className="font-md mb-3 text-sm tracking-tight" {...props} />;
};

const p = (props) => {
	return <p className="font-md text-md mb-5 tracking-tight" {...props} />;
};

const img = (props) => {
	return (
		<span className="block rounded-xl border bg-content2/60 p-4 shadow-sm duration-300 hover:rounded-2xl hover:p-2 hover:shadow-lg">
			<img className="rounded-sm shadow-md duration-300 hover:rounded-lg" {...props} />
		</span>
	);
};

const a = (props) => {
	let truncated = props.href.slice(0, 40);
	if (props.href.length > 40) {
		truncated += "...";
	}
	if (props.href.includes("http")) {
		return (
			<Link
				truncated={truncated}
				target="_blank"
				className="font-md text-md mb-5 max-w-[300px] truncate tracking-tight text-blue-700 duration-300 after:content-['_↗'] hover:rounded-3xl hover:bg-blue-700 hover:px-4 hover:text-white hover:shadow-lg hover:after:content-['_('attr(truncated)')_↗']"
				{...props}
			/>
		);
	}
	return (
		<Link
			truncated={truncated}
			className="font-md text-md mb-5 max-w-[300px] truncate tracking-tight text-blue-700 duration-300 after:content-['_↗'] hover:rounded-3xl hover:bg-primary hover:px-4 hover:text-white hover:shadow-lg hover:after:content-['_(medimun.org'attr(truncated)')_↗']"
			{...props}
		/>
	);
};

const hr = (props) => {
	return <hr className="font-md text-md mb-5 tracking-tight" {...props} />;
};
const li = (props) => {
	return <li className="font-md text-md mx-2 tracking-tight " {...props} />;
};

const ol = (props) => {
	return <ol className="font-md text-md mb-5 bg-black tracking-tight" {...props} />;
};

const ul = (props) => {
	return <ol className="font-md text-md mb-5 border-l-2 border-gray-300 pl-3 tracking-tight" {...props} />;
};
