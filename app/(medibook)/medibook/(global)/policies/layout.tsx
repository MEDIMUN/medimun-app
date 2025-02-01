export default function Layout({ children, policyModals }) {
	return (
		<>
			{policyModals}
			{children}
		</>
	);
}
