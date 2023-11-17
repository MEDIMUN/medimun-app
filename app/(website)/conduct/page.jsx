import Background from "@/components/website/Background";
import { MDXRemote } from "next-mdx-remote/rsc";

export const metadata = {
	title: "Code of Conduct",
};

const policy = `
_Last Updated: 11/11/2023_

**Dress Code**
- Participants are required to wear formal attire throughout both the Workshop and Conference phases.

**Photography and Privacy**
- Photographs must not be taken without the consent of the individuals involved. This is in strict compliance with GDPR laws in the EU.

**Non-Discrimination Policy**
- Discrimination of any form is strictly prohibited. This includes, but is not limited to, discrimination based on religious affiliation, sexual orientation, gender identity, national origin, ethnicity, skin color, mental or physical ability.

**Respect and Conduct**
- Racist, sexist, or otherwise offensive comments or actions are not tolerated at any point during MEDIMUN events.
- Bullying or harassment, including cyberbullying and verbal abuse, is strictly condemned.

**Intellectual Honesty**
- Copying resolutions from others or photographing another delegate's resolution without permission is not permitted.

**Respect for Property**
- Any damage to property at The English School or the European University's premises is strictly forbidden.

**Behavior During Sessions**
- Disruption of committee sessions or harassment of staff, Secretariat members, or other participants is unacceptable.

**Substance Use**
- Consumption of alcohol or use of tobacco products by delegates is prohibited during the Workshop and Conference.

**Consequences of Misconduct**
- Violation of these guidelines may result in disciplinary actions, including temporary suspension or expulsion from MEDIMUN 2024 and future events, non-issuance of attendance certificates, or other appropriate sanctions.

**Reporting Misconduct**
- Please report any incidents of misconduct to your chair/manager, a member of the Secretariat, your Director, or Senior Director. All reports will be thoroughly investigated.
`;

export default async function Page() {
	const elId = Math.random().toString(36);
	return (
		<>
			<Background id={elId} />
			<div id={elId} className="mx-auto max-w-[1248px] p-5 pt-20 font-[montserrat] text-white">
				<h1 className="select-none rounded-3xl font-[Montserrat] text-[35px] font-[700] text-white">Code of Conduct</h1>
				<MDXRemote components={{ h1, h2, h3, h4, h5, h6, p, a, hr, li, ol, ul }} source={policy} />
			</div>
		</>
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

const a = (props) => {
	let truncated = props.href.slice(0, 40);
	if (props.href.length > 40) {
		truncated += "...";
	}
	if (props.href.includes("http")) {
		return <a truncated={truncated} target="_blank" className="font-md text-md mb-5 max-w-[300px] truncate tracking-tight text-blue-700 duration-300 after:content-['_↗'] hover:rounded-3xl hover:bg-blue-700 hover:p-2 hover:px-4 hover:text-white hover:shadow-lg hover:after:content-['_('attr(truncated)')_↗']" {...props}></a>;
	}
	return <Link truncated={truncated} className="font-md text-md mb-5 max-w-[300px] truncate tracking-tight text-blue-700 duration-300 after:content-['_↗'] hover:rounded-3xl hover:bg-[var(--medired)] hover:p-2 hover:px-4 hover:text-white hover:shadow-lg hover:after:content-['_(Internal_Navigation:'attr(truncated)')_↗']" {...props} />;
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
