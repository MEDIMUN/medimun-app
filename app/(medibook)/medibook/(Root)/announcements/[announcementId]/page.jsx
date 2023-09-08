import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { MDXRemote } from "next-mdx-remote/rsc";
import prisma from "@/prisma/client";
import Image from "next/image";
import Link from "next/link";
import { TitleBar, e as s } from "@/components/medibook/TitleBar";
import { deleteAnnouncement } from "./delete-announcement.server";

export async function generateMetadata({ params }) {
	const { title } = await getData({ params });
	return {
		title: `${title} | Announcements - MediBook`,
	};
}

const errorChecker = (fn) => {
	try {
		fn();
	} catch (e) {
		if (process.env.NODE_ENV == "development") console.log(e);
	}
};

async function getData({ params }) {
	let announcement;
	errorChecker(
		(announcement = await prisma.announcement.findUnique({
			where: {
				id: params.announcementId,
			},
			include: {
				user: {
					select: {
						officialName: true,
						officialSurname: true,
						displayName: true,
					},
				},
				AlumniAnnouncement: {
					select: {
						id: true,
					},
				},
			},
		}))
	);
	if (!announcement) return notFound();
	return announcement;
}

export default async function Page({ params, searchParams }) {
	const session = await getServerSession(authOptions);
	const announcement = await getData({ params, searchParams, session });
	const user = announcement.user;
	const fullName = !announcement.isAnonymous ? user.displayName || user.officialName + " " + user.officialSurname : "Anonymous";
	const publishedDate = announcement?.time.toLocaleString("en-uk", { month: "long", day: "numeric", year: "numeric" });
	return (
		<>
			<TitleBar
				description={`${publishedDate}${" · " + fullName}${announcement.isBoard ? "· (The MEDIMUN Board)" : ""}${announcement.isSecretariat ? "· (The Secretariat)" : ""}`}
				title={announcement.title}
				button1text="Edit"
				button1href={`/medibook/announcements/${params.announcementId}?edit`}
				button1roles={[s.management]}
				button2text="Delete"
				button2action={async () => {
					"use server";
					const res = await deleteAnnouncement(params.announcementId);
					if (res?.ok) redirect("/medibook/announcements");
				}}
				button2style="bg-red-500 text-white hover:bg-red hover:text-white"
				button2roles={[s.management]}
			/>
			<div className="min-h-auto max-w-full overflow-x-hidden p-5">
				<div className="min-h-auto mx-auto mt-5 max-w-[1200px] gap-[24px] ">
					<MDXRemote components={{ img: ResponsiveImage, h1, h2, h3, h4, h5, h6, p, a, hr, li, ol, ul }} source={announcement.markdown} />
					<p className="mt-auto select-none text-sm font-extralight text-gray-300">
						<strong>This text contains Automatically Generated Content</strong>
						<br />
						We are not responsible for any kind automatically generated content as per our policy.
					</p>
				</div>
			</div>
		</>
	);
}

const ResponsiveImage = (props) => {
	if (props.src.includes("http")) {
		return (
			<img
				className="mx-auto rounded-xl bg-gray-100 p-4 shadow-lg duration-300 hover:shadow-xl"
				alt="custom image"
				width={100}
				height={100}
				style={{ width: "70%", height: "auto" }}
				{...props}
			/>
		);
	}
	return (
		<Image
			className="mx-auto rounded-xl bg-gray-100 p-4 shadow-lg duration-300 hover:shadow-xl"
			alt="custom image"
			width={100}
			height={100}
			style={{ width: "70%", height: "auto" }}
			{...props}
		/>
	);
};

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
