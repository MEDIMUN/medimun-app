import { useEffect, useRef } from "react";

export const useUpdateEffect: typeof useEffect = (effect, deps) => {
	const isFirstMount = useRef(true);

	useEffect(() => {
		if (!isFirstMount.current) effect();
		else isFirstMount.current = false;
	}, deps);
};
