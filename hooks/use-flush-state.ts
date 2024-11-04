"use client";

import { useState } from "react";
import { flushSync } from "react-dom";

export function useFlushState(initialState: any) {
	const [value, setValue] = useState(initialState);

	const setFlush = (newValue: any) => {
		flushSync(() => {
			setValue(newValue);
		});
	};

	return [value, setValue, setFlush];
}
