import { SearchParamsButton, TopBar } from "../../client-components";

export default async function Page({ searchParams }) {
	return (
		<>
			<TopBar title="Invoices">
				<SearchParamsButton searchParams={{ "create-invoice": true }}>Create New</SearchParamsButton>
			</TopBar>
		</>
	);
}
