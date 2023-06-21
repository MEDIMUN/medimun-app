import SearchBar from "./SearchBar";

export const metadata = {
	title: "Users - MediBook",
};

export default function Page() {
	return (
		<div className="p-5">
			<SearchBar />
			<div className="mt-5 max-w-[1200px] gap-[24px] mx-auto grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1"></div>
		</div>
	);
}
