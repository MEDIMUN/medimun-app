import { TitleBar } from "@/components/medibook/TitleBar";
import Navigation from "./Navigation";

export default function Layout(props) {
	return (
		<>
			<div className="top-0 h-auto w-full bg-white pt-1">
				<TitleBar title="Settings" />
			</div>
			<div className="mt-1 flex min-h-screen w-full flex-row p-4">
				<div className="mx-auto w-full max-w-[1200px]">
					<div className="flex flex-col md:flex-row">
						<Navigation />
						<div className="mt-6 min-h-screen w-full md:ml-4 md:mt-0">{props.children}</div>
					</div>
				</div>
			</div>
		</>
	);
}
