export default function Layout({ children, delegateAssignmentModals }) {
	return (
		<>
			{delegateAssignmentModals}
			{children}
		</>
	);
}
