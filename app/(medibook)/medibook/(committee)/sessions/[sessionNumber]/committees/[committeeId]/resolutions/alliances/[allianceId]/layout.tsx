export default function Layout({ children, clauseModals }) {
	return (
		<>
			{clauseModals}
			{children}
		</>
	);
}
