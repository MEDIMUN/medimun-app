import prisma from "@/prisma/client";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import Link from "next/link";
import { SearchParamsButton, TopBar } from "../../../client-components";
import { authorize, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { MainWrapper } from "@/components/main-wrapper";
import { notFound } from "next/navigation";

export async function generateMetadata(props: { params: Promise<{ policySlug: string }> }) {
	const params = await props.params;
	const selectedPolicy = await prisma.policy
		.findFirstOrThrow({
			where: {
				OR: [{ slug: params.policySlug }, { id: params.policySlug }],
			},
		})
		.catch(notFound);
	return {
		title: `${selectedPolicy.title} - Conference Policies`,
		description: selectedPolicy.description,
	};
}

export default async function Page(props) {
	const params = await props.params;
	const authSession = await auth();
	const selectedPolicy = await prisma.policy
		.findFirstOrThrow({ where: { OR: [{ slug: params.policySlug }, { id: params.policySlug }] } })
		.catch(notFound);

	const isManagement = authorize(authSession, [s.director, s.sd]);

	return (
		<>
			<TopBar
				hideBackdrop
				hideSearchBar
				buttonHref="/medibook/policies"
				buttonText="All Policies"
				subheading={selectedPolicy?.description ? selectedPolicy.description : ""}
				title={selectedPolicy.title}>
				{isManagement && (
					<>
						<SearchParamsButton searchParams={{ "edit-policy": selectedPolicy.id }}>Edit</SearchParamsButton>
						<SearchParamsButton searchParams={{ "delete-policy": selectedPolicy.id }}>Delete</SearchParamsButton>
					</>
				)}
			</TopBar>
			<MainWrapper>
				<MDXRemote components={{ h1, h2, h3, h4, h5, h6, p, a, hr, li, ol, ul }} source={selectedPolicy.markdown} />
			</MainWrapper>
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
	return <h3 className="font-md mb-3 text-xl font-bold tracking-tight" {...props} />;
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
	return <p className="font-md text-md text mb-5 tracking-tight" {...props} />;
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
