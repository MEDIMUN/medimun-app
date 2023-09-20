import Background from "@/components/website/Background";
import prisma from "@/prisma/client";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Page({ params }) {
	const id = Math.random().toString(36);
	const announcement = await getData(params.announcementId);
	const user = announcement.user;
	const fullName = !announcement.isAnonymous ? user.displayName || user.officialName + " " + user.officialSurname : "Anonymous";
	const publishedDate = announcement?.time.toLocaleString("en-uk", { month: "long", day: "numeric", year: "numeric" });
	return (
		<>
			<div id={id} className="z-[40] h-auto min-h-screen w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 font-[Montserrat] text-xl font-[700] text-black">
				<div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 pt-[96px] md:p-4 md:pt-[96px]">
					<div>
						<Link href="/announcements">
							<Button className="mb-4 ml-4 h-[20px]  rounded-[50px] bg-white text-[10px] text-black duration-500 hover:bg-medired hover:text-white">← ALL ANNOUNCEMENTS</Button>
						</Link>
						<h1 className="ml-4 rounded-3xl font-[Montserrat] text-[35px] font-[700] leading-8 ">{announcement.title}</h1>
						<h2 className="ml-4 mt-2 rounded-3xl font-[Montserrat] text-[20px] font-[300] ">{`${publishedDate}${" · " + fullName}${
							announcement.isBoard ? "· (The MEDIMUN Board)" : ""
						}${announcement.isSecretariat ? "· (The Secretariat)" : ""}`}</h2>
					</div>
					<div className="mx-4">
						<MDXRemote components={{ img: ResponsiveImage, h1, h2, h3, h4, h5, h6, p, a, hr, li, ol, ul }} source={announcement.markdown} />
						<p className="select-none pb-[10px] pt-[512px] text-sm font-extralight text-gray-400">
							<strong>This page contains Automatically Generated Content</strong>
							<br />
							We are not responsible for any kind automatically generated content as per our policy.
						</p>
					</div>
				</div>
			</div>
		</>
	);
}

async function getData(announcementId) {
	let announcement;
	try {
		announcement = await prisma.announcement.findUnique({
			where: {
				id: announcementId,
			},
			include: {
				user: {
					select: {
						officialName: true,
						officialSurname: true,
						displayName: true,
					},
				},
			},
		});
	} catch (e) {
		notFound();
	}
	if (!announcement) notFound();
	return announcement;
}

const ResponsiveImage = (props) => {
	if (props.src.includes("http")) {
		return <img className="px-auto w-full rounded-sm bg-gray-100 shadow-lg duration-300 hover:shadow-xl md:w-[70%]" alt="custom image" width={100} height={100} {...props} />;
	}
	return <Image className="px-auto w-full rounded-sm bg-gray-100 shadow-lg duration-300 hover:shadow-xl md:w-[70%]" alt="custom image" width={100} height={100} {...props} />;
};

const h1 = (props) => {
	return <h1 className="text-3xl" {...props} />;
};

const h2 = (props) => {
	return <h2 className="text-2xl" {...props} />;
};

const h3 = (props) => {
	return <h3 className="text-xl" {...props} />;
};

const h4 = (props) => {
	return <h4 className="text-lg" {...props} />;
};

const h5 = (props) => {
	return <h5 className="text-[16px]" {...props} />;
};

const h6 = (props) => {
	return <h6 className="text-sm" {...props} />;
};

const p = (props) => {
	return <p className="font-md py-1" {...props} />;
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
				className="max-w-[300px] truncate tracking-tight text-blue-700 duration-300 after:content-['_↗'] hover:rounded-3xl hover:bg-blue-700 hover:p-2 hover:px-4 hover:text-white hover:shadow-lg hover:after:content-['_('attr(truncated)')_↗']"
				{...props}></a>
		);
	}
	return (
		<Link
			truncated={truncated}
			className="max-w-[300px] truncate tracking-tight text-blue-700 duration-300 after:content-['_↗'] hover:rounded-3xl hover:bg-[var(--medired)] hover:p-2 hover:px-4 hover:text-white hover:shadow-lg hover:after:content-['_(Internal_Navigation:'attr(truncated)')_↗']"
			{...props}
		/>
	);
};

const hr = (props) => {
	return <hr className="my-2 tracking-tight" {...props} />;
};
const li = (props) => {
	return <li className="tracking-tight " {...props} />;
};

const ol = (props) => {
	return <ol className="rounded-sm p-4 tracking-tight" {...props} />;
};

const ul = (props) => {
	return <ol className="font-md text-md mb-5 border-l-2 border-gray-300 pl-3 tracking-tight" {...props} />;
};
