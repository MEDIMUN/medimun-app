import { Children } from "react";

export default async function Page({ children, modals }) {
	return (
		<>
			{children}
			{modals}
		</>
	);
}
