"use client";

import { TopBar } from "@/app/(medibook)/medibook/client-components";
import { useParams, usePathname } from "next/navigation";

export function ResoPageTopbar({ title, subheading, buttonText, buttonHref, ...props }) {
	const pathname = usePathname();
	const params = useParams();

	if (pathname && pathname.includes("approval-panel")) {
		buttonText = "Approval Panel";
		buttonHref = `/medibook/sessions/${params?.sessionNumber || "1"}/approval-panel`;
	}
	return <TopBar {...props} title={title} subheading={subheading} buttonText={buttonText} buttonHref={buttonHref} />;
}
