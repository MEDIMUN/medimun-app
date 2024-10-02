"use client";

import { init, push } from "@socialgouv/matomo-next";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const MATOMO_URL = "https://analytics.manage.medimun.org/";
const MATOMO_SITE_ID = "1";

export function MatomoAnalytics() {
	const pathname = usePathname();
	const isInitialLoad = useRef(true);
	const { data: authSession, status } = useSession();

	useEffect(() => {
		init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID, disableCookies: status === "unauthenticated" });
		return () => push(["HeatmapSessionRecording::disable"]);
	}, []);

	useEffect(() => {
		if (isInitialLoad.current) {
			isInitialLoad.current = false;
		} else {
			if (pathname) {
				push(["setCustomUrl", pathname]);
				push(["trackPageView"]);
				if (status === "authenticated") {
					push(["setUserId", authSession?.user?.id]);
				}
			}
		}
	}, [pathname]);

	return null;
}
