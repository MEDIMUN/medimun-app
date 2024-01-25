import { redirect } from "next/navigation";
export default async function Page({ params }) {
	redirect(`/medibook/sessions/${params.sessionNumber}#committees`);
}
