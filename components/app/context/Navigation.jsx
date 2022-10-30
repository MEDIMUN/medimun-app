import { useState, createContext } from "react";

const AppContext = createContext({
	sidebarVisibility: false,
	setSidebarVisibility: function () {},
	sidebarOptionsVisibility: false,
	setSidebarOptionsVisibility: function () {},
});

export function AppContextProvider(props) {
	const [sidebarVisibility, setSidebarVisibility] = useState(false);
	const [sidebarOptionsVisibility, setSidebarOptionsVisibility] = useState(false);

	function toggleSidebarHandler() {
		setSidebarVisibility(!sidebarVisibility);
	}

	function toggleSidebarOptionsHandler() {
		setSidebarOptionsVisibility(!sidebarOptionsVisibility);
	}

	const context = {
		sidebarVisibility: sidebarVisibility,
		toggleSidebarVisibility: toggleSidebarHandler,
		sidebarOptionsVisibility: sidebarOptionsVisibility,
		toggleSidebarOptionsVisibility: toggleSidebarOptionsHandler,
	};

	return <AppContext.Provider value={context}>{props.children}</AppContext.Provider>;
}

export default AppContext;
