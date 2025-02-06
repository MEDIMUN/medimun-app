export default function Layout({ children, submitterModals, resolutionModals, allianceModals }) {
	return (
		<>
			{resolutionModals}
			{submitterModals}
			{allianceModals}
			{children}
		</>
	);
}
