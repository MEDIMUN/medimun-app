import { SearchParamsButton, TopBar } from "../../client-components";

export default async function Page(props) {
    const searchParams = await props.searchParams;
    return (
		<>
			<TopBar title="Invoices">
				<SearchParamsButton searchParams={{ "create-invoice": true }}>Create New</SearchParamsButton>
			</TopBar>
		</>
	);
}
