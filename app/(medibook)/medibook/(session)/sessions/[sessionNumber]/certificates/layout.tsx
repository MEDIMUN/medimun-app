import { SelectedContextProvider } from "@/app/(medibook)/medibook/(global)/users/components/StateStateProvider";

export default function Layout({ children, certificatePublishModals }) {
	return (
		<SelectedContextProvider defaultUserData={[]}>
			{children}
			{certificatePublishModals}
		</SelectedContextProvider>
	);
}
// Compare this snippet from app/%28medibook%29/medibook/%28global%29/users/page.tsx:
