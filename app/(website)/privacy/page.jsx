import Background from "@/components/website/Background";
import { MDXRemote } from "next-mdx-remote/rsc";

export const metadata = {
	title: "Privacy Policy",
};

const policy = `
_Last Updated: 11/11/2023_

**Introduction**
Welcome to MediBook, the official app of the Mediterranean Model United Nations (MEDIMUN). This Privacy Policy outlines how we collect, use, store, and protect your personal information. By creating an account on MediBook, you are agreeing to this policy and our integrated Code of Conduct.

**User Consent**
By signing up for a MediBook account, all delegates, chairs, members, and managers explicitly agree to abide by this Privacy Policy and the MEDIMUN Code of Conduct.

**Data Collection and Use**
We collect personal information such as names, contact details, and images to facilitate your participation in MEDIMUN activities. This information is used solely for the operation of MediBook and is not shared with third parties, except for "The English School" and current MEDIMUN management and student leaders.

**GDPR Compliance**
In compliance with the General Data Protection Regulation (GDPR), you have the right to access your personal data, request its deletion, and inquire about its use. 

**Data Storage and Security**
Your personal data is stored securely and is only accessible to authorized personnel. We employ robust security measures to protect against unauthorized access or data breaches.

**Data Retention and Deletion**
Personal data is retained for the duration of your engagement with MEDIMUN. You may request the deletion of your data at any time. Note that deleting your data will result in the invalidation of any certificates verified through our /verify service. Partial data deletion occurs upon account closure.

**Code of Conduct Integration**
Our Code of Conduct mandates respectful and responsible behavior during all MEDIMUN events. Accepting this Privacy Policy also constitutes acceptance of the Code of Conduct. Breaches of the Code may result in disciplinary actions, including suspension or expulsion from MEDIMUN events and the non-issuance of a certificate of attendance.

**Reporting and Enforcement**
To report a violation of the Code of Conduct, please contact your chair/manager, a member of the Secretariat, your Director, or Senior Director. Reported incidents will be investigated promptly.

**Updates to the Privacy Policy**
We may update this policy periodically. Users will be notified of any significant changes through MediBook or via email.

**Contact Information**
For any questions or concerns regarding this policy or to report a conduct violation, please contact us at [insert contact email/phone number].

**Acknowledgment and Agreement**
By using MediBook, you acknowledge and agree to the terms outlined in this Privacy Policy and the MEDIMUN Code of Conduct.
`;

export default async function Page() {
	const elId = Math.random().toString(36);
	return (
		<>
			<Background id={elId} />
			<div id={elId} className="mx-auto max-w-[1248px] p-5 pt-20 font-[montserrat] text-white">
				<h1 className="select-none rounded-3xl font-[Montserrat] text-[35px] font-[700] text-white">MEDIMUN & MediBook Privacy Policy</h1>
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
		return (
			<a
				truncated={truncated}
				target="_blank"
				className="font-md text-md mb-5 max-w-[300px] truncate tracking-tight text-blue-700 duration-300 after:content-['_↗'] hover:rounded-3xl hover:bg-blue-700 hover:p-2 hover:px-4 hover:text-white hover:shadow-lg hover:after:content-['_('attr(truncated)')_↗']"
				{...props}></a>
		);
	}
	return (
		<Link
			truncated={truncated}
			className="font-md text-md mb-5 max-w-[300px] truncate tracking-tight text-blue-700 duration-300 after:content-['_↗'] hover:rounded-3xl hover:bg-[var(--medired)] hover:p-2 hover:px-4 hover:text-white hover:shadow-lg hover:after:content-['_(Internal_Navigation:'attr(truncated)')_↗']"
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
