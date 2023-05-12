import SubMenu from "./SubMenu";

export default function Layout({ children }) {
	return (
		<>
			<SubMenu />
			{children}
		</>
	);
}
