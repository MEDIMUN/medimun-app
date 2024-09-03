import { MDXRemote } from "next-mdx-remote-client/rsc";

export const metadata = {
	title: "Terms of Service",
};

const policy = `
### Introduction
Welcome to MediBook, provided by the Mediterranean Model United Nations (MEDIMUN). These Terms of Service ("Terms") govern your access to and use of MediBook. By using our services, you agree to be bound by these Terms.

### Services Description
MediBook is an application designed to facilitate participation in MEDIMUN activities, including but not limited to event registration, information dissemination, and communication among participants.

### User Accounts
To access MediBook, you must create an account. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your devices.

### User Conduct
Users are expected to use MediBook in a responsible and lawful manner. Prohibited activities include, but are not limited to:
- Engaging in illegal activities or violating any local, state, national, or international law or regulation.
- Posting or transmitting any content that infringes on the rights of others.
- Attempting to interfere with or disrupt the service or servers or networks connected to the service.

### Intellectual Property Rights
All content on MediBook, including text, graphics, logos, and software, is the property of MEDIMUN or its licensors and is protected by copyright and other intellectual property laws.

### Data Protection and Privacy
Your privacy is important to us. The collection and use of personal data are governed by our Privacy Policy, which is incorporated into these Terms by reference.

### Modification of Terms
We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page.

### Termination
We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including, without limitation, a breach of the Terms.

### Disclaimers and Limitation of Liability
MediBook is provided on an "AS IS" and "AS AVAILABLE" basis. MEDIMUN makes no representations or warranties of any kind, express or implied, as to the operation of MediBook or the information, content, or materials included therein.

### Governing Law
These Terms shall be governed by and construed in accordance with the laws of The Republic of Cyprus, without regard to its conflict of law provisions.

### Contact Us
For any questions about these Terms, please contact us at info@medimun.org.
`;

export default async function Page() {
	return (
		<div className="mx-auto mb-96 max-w-[800px] bg-cover p-5 pt-20 font-[TTNormsProRegular]">
			<div className="mb-20 mt-24">
				<h1 className="rounded-3xl text-center font-[Montserrat] text-4xl font-[700] text-content1-foreground md:text-5xl">Terms of Service</h1>
				<p className="mx-auto mt-2 text-center text-sm">Last updated on November 2, 2023</p>
			</div>
			<MDXRemote components={{ h1, h2, h3, h4, h5, h6, p, a, hr, li, ol, ul }} source={policy} />
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
			className="font-md text-md mb-5 max-w-[300px] truncate tracking-tight text-blue-700 duration-300 after:content-['_↗'] hover:rounded-3xl hover:bg-primary hover:p-2 hover:px-4 hover:text-white hover:shadow-lg hover:after:content-['_(Internal_Navigation:'attr(truncated)')_↗']"
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
