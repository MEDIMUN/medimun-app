import { TopBar } from "@/app/(medibook)/medibook/client-components";

export default async function SpecificDaySchedulePage(props) {
	const dayName = await props?.params?.dayName;
	let friendlyDayName = "";
	//conference-day-n or workshop-day-n
	const dayNameLower = dayName.toLowerCase();
	const dayNameParts = dayNameLower.split("-");

	return (
		<>
			<TopBar title="Day"></TopBar>
		</>
	);
}
