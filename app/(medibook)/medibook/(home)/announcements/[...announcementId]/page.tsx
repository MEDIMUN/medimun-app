import prisma from "@/prisma/client";
import { TopBar } from "../../../client-components";
import { Button } from "@/components/button";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import { Divider } from "@/components/divider";
import { Suspense } from "react";
import { Subheading } from "@/components/heading";
import { Link } from "@/components/link";
import { announcementWebsitecomponents } from "../../../@announcementModals/default";

export default async function Page({ params, baseUrl = "/medibook/announcements" }) {
	const selectedAnnouncement = await prisma.announcement.findUnique({
		where: {
			id: params.announcementId[0],
		},
	});

	return (
		<>
			<TopBar
				subheading={selectedAnnouncement.description}
				buttonHref={baseUrl}
				buttonText="Announcements"
				title={selectedAnnouncement.title}
				hideSearchBar>
				<Button className="mr-2 md:-translate-y-5">Edit Announcement</Button>
			</TopBar>
			<Suspense fallback={<div>404</div>}>
				<MDXRemote components={{ ...announcementWebsitecomponents }} source={selectedAnnouncement.markdown} />
			</Suspense>
			<Divider className="mt-[512px]" />
			<Subheading className="mt-10 !font-extralight">
				{"We are not responsible for the contents of announcements. Please refer to our "}
				<Link className="underline hover:text-primary" href="/conduct#announcements" target="_blank">
					code of conduct
				</Link>
				{" and "}
				<Link className="underline hover:text-primary" href="/conduct#announcements" target="_blank">
					terms of service
				</Link>
				{" for more information."}
			</Subheading>
		</>
	);
}
