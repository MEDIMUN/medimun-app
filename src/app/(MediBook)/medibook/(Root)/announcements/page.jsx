import SearchBar from "./SearchBar";
import Drawer from "./Drawer";

export const metadata = {
	title: "Announcements - MediBook",
	description: "View all the latest announcements from MEDIMUN.",
};

export default async function Page() {
	return (
		<>
			<Drawer />
			<div className="p-5">
				<SearchBar />
				<div className="mt-5 max-w-[1200px] gap-[24px] mx-auto ">
					<div className="pl-2 mt-5">
						<h2 className="font-md text-xl font-bold tracking-tight">Latest Announcements</h2>
					</div>
				</div>
			</div>
		</>
	);
}
