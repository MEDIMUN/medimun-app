import { ModalCreateDepartment } from "./modals";

export default async function Modals(props) {
	const searchParams = await props.searchParams;
	return <ModalCreateDepartment />;
}
