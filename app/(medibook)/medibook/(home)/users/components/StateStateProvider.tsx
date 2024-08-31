"use client";

import { useSearchParams } from "next/navigation";
import React from "react";

const SelectedContext = React.createContext([]);

export function SelectedContextProvider({ children, defaultUserData }) {
	const searchParams = useSearchParams();
	//defaultUserData
	const defaultValue = defaultUserData.map((user) => ({ id: user.id, officialName: user.officialName, displayName: user.displayName }));
	const [selected, setSelected] = React.useState(defaultValue);

	return <SelectedContext.Provider value={{ selected, setSelected }}>{children}</SelectedContext.Provider>;
}

export function useSelectedContext() {
	const context = React.useContext(SelectedContext);
	if (context === undefined) {
		throw new Error("useSelectedContext must be used within a SelectedContextProvider");
	}
	return context;
}
