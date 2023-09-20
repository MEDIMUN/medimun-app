import SearchBar from "./SearchBar";
import { TitleBar, e as s } from "@/components/medibook/TitleBar";
import DataTableDemo from "./table";

export const metadata = {
	title: "Users - MediBook",
};

export default function Page() {
	return (
		<>
			<TitleBar
				title="Users"
				bgColor="bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] bg-center from-gray-900 via-gray-100 to-gray-900 bg-cover bg-opacity-50 bg-[url(https://www.englishschool.ac.cy/udata/contents/images/Galleries/Feb-08/P2062104.JPG)]"
			/>
			<div className="p-5">
				<SearchBar />
				<div className="mx-auto mt-5 max-w-[1200px] grid-cols-1 gap-[24px] md:grid-cols-2 lg:grid-cols-3">
					<DataTableDemo />
				</div>
			</div>
		</>
	);
}
