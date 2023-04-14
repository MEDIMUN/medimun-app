import { useState, createContext } from "react";

const AppContext = createContext({
	sidebarVisibility: false,
	setSidebarVisibility: function () {},
	sidebarOptionsVisibility: false,
	setSidebarOptionsVisibility: function () {},
});

export function AppContextProvider(props) {
	const [sidebarVisibility, setSidebarVisibility] = useState("Shown");
	const [sidebarOptionsVisibility, setSidebarOptionsVisibility] = useState(false);

	async function toggleSidebarHandler() {
		const delay = (ms) => new Promise((res) => setTimeout(res, ms));
		if (sidebarVisibility === "Hidden" || sidebarVisibility === "Hide") {
			setSidebarVisibility("Show");
			await delay(500);
			setSidebarVisibility("Shown");
		}
		if (sidebarVisibility === "Shown" || sidebarVisibility === "Hide") {
			setSidebarVisibility("Hide");
			await delay(500);

			setSidebarVisibility("Hidden");
		}
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
