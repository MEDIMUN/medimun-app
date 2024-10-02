"use client";

import { init, push } from "@socialgouv/matomo-next";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const MATOMO_URL = "https://analytics.manage.medimun.org/";
const MATOMO_SITE_ID = "1";

export function MatomoAnalytics() {
	const pathname = usePathname();
	const isInitialLoad = useRef(true);

	useEffect(() => {
		init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID });
		return () => push(["HeatmapSessionRecording::disable"]);
	}, []);

	useEffect(() => {
		if (isInitialLoad.current) {
			isInitialLoad.current = false;
		} else {
			if (pathname) {
				push(["setCustomUrl", pathname]);
				push(["trackPageView"]);
			}
		}
	}, [pathname]);

	return null;
}
