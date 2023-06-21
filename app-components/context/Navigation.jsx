import { useState, createContext } from "react";
import { useSession } from "next-auth/react";

const AppContext = createContext({
	sidebarVisibility: false,
	setSidebarVisibility: function () {},
	sidebarOptionsVisibility: false,
	setSidebarOptionsVisibility: function () {},
	userData: {},
	setUserData: function () {},
	selectedSession: {},
	setSelectedSession: function () {},
	allSessions: [],
	setAllSessions: function () {},
});

export function AppContextProvider(props) {
	const { data: session, status } = useSession();

	const [sidebarVisibility, setSidebarVisibility] = useState(true);
	const [sidebarOptionsVisibility, setSidebarOptionsVisibility] = useState(false);
	const [userData, setUserData] = useState(session ? session.user : {});
	const [selectedSession, setSelectedSession] = useState();
	const [allSessions, setAllSessions] = useState([]);

	async function toggleSidebarHandler() {
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
		userData: userData,
		setUserData: setUserData,
		selectedSession: selectedSession,
		setSelectedSession: setSelectedSession,
		allSessions: allSessions,
		setAllSessions: setAllSessions,
	};

	return <AppContext.Provider value={context}>{props.children}</AppContext.Provider>;
}

export default AppContext;
