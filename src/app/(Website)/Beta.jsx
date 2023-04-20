import Link from "next/link";

export default function Beta() {
	return (
		<div className="border-2 flex flex-row border-red-500 bg-slate-50 text-[10px] text-left justify-center fixed bottom-0 right-0 rounded-[15px] h-[50px] p-1.5 w-[400px] z-[350] m-2.5 shadow-md">
			<div>
				<strong>This is a beta application.</strong>
				<br />
				Things may not work as expected, please report any bugs to us.
			</div>
			<Link className="flex my-auto ml-3 justify-center align-middle" href="/feedback?title=Bug-Report">
				<div className="cursor-pointer bg-red-500 p-1.5 h-min rounded-xl ml-1 my-auto text-white hover:bg-white hover:text-red-500 border-red-500 hover:border-1 md:w-max md:m-0">Report</div>
			</Link>
		</div>
	);
}
