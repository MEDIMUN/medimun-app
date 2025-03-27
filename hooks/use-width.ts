"use client";

import useResizeObserver from "@react-hook/resize-observer";
import { useLayoutEffect, useState } from "react";

export function useWidth(target, ...others) {
	const [width, setWidth] = useState(null);
	const [height, setHeight] = useState(null);

	useLayoutEffect(() => {
		if (target.current) {
			setWidth(target.current?.getBoundingClientRect().width);
			setHeight(target.current?.getBoundingClientRect().height);
		}
	}, [target, ...others]);

	useResizeObserver(target, (entry) => setWidth(entry?.contentRect?.width));
	useResizeObserver(target, (entry) => setHeight(entry?.contentRect?.height));
	return { width, height };
}
