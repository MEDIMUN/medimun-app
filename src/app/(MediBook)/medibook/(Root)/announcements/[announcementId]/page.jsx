import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { MDXRemote } from "next-mdx-remote/rsc";
import prisma from "@/prisma/client";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata({ params }) {
	const { title } = await getData({ params });
	return {
		title: `${title} | Announcements - MediBook`,
	};
}

async function getData({ params, searchParams }) {
	const announcement = await prisma.announcement.findUnique({
		where: {
			id: params.announcementId,
		},
		include: {
			sender: {
				select: {
					officialName: true,
					displayName: true,
					officialSurname: true,
				},
			},
		},
	});
	if (!announcement) return notFound();
	const fullName = announcement?.sender.officialName + " " + announcement?.sender.officialSurname;
	const displayName = announcement?.sender.displayName;
	const preferredName =
		(!announcement?.isBoard && !announcement?.isSecretariat ? " · " : " · ") +
		(!announcement?.isAnonymous
			? displayName || fullName
			: announcement?.isBoard
			? ""
			: announcement?.isSecretariat
			? ""
			: "Anonymous");
	const publishedDate = announcement?.time.toLocaleString().split(",")[0];
	const title = announcement?.title || "No Title";
	const board = announcement?.isBoard ? " · MEDIMUN Board" : "";
	const secretariat = announcement?.isSecretariat ? " · MEDIMUN Secretariat" : "";
	const info = publishedDate + preferredName + board + secretariat;

	return { announcement, title, info };
}

export default async function Page({ params, searchParams }) {
	const session = await getServerSession(authOptions);
	if (!session || session.isDisabled) redirect("/signout");

	const { announcement, title, info } = await getData({ params, searchParams });
	return (
		<div className="min-h-auto max-w-full overflow-x-hidden p-5">
			<div className="min-h-auto mx-auto mt-5 max-w-[1200px] gap-[24px] ">
				<h1 className="font-md text-3xl font-bold tracking-tight">{title}</h1>
				<h2 className="font-md text-md mb-5 tracking-tight">{info}</h2>
				<div class="my-8 h-[1px] border-0 bg-gray-300 dark:bg-gray-700" />
				<MDXRemote
					components={{ img: ResponsiveImage, h1, h2, h3, h4, h5, h6, p, a, hr, li, ol, ul }}
					source={announcement?.markdown || "No Content"}
				/>
				<p className="mt-auto select-none text-sm font-extralight text-gray-300">
					<strong>This text contains Automatically Generated Content</strong>
					<br />
					We are not responsible for any kind automatically generated content as per our policy.
				</p>
			</div>
		</div>
	);
}

const ResponsiveImage = (props) => {
	return (
		<Image
			className="rounded-xl bg-gray-100 p-4 shadow-lg duration-300 hover:shadow-xl"
			alt="custom image"
			width={100}
			height={100}
			style={{ width: "70%", height: "auto" }}
			{...props}
		/>
	);
};

const h1 = (props) => {
	return (
		<h1 className="font-md mb-3 select-none text-3xl tracking-tight text-red-700" {...props} />
	);
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
	return (
		<ol
			className="font-md text-md mb-5 border-l-2 border-gray-300 pl-3 tracking-tight"
			{...props}
		/>
	);
};
