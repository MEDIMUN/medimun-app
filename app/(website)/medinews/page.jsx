import Background from "@/components/website/Background";

export default async function Page() {
	const elId = Math.random().toString(36);
	return (
		<>
			<Background id={elId} />
			<div id={elId} className="mx-auto max-w-[1248px] p-5 pt-24 font-[montserrat] text-white">
				<h1 className="select-none rounded-3xl font-[Montserrat] text-[35px] font-[700] text-white">MediNews</h1>
				<p>Get Hyped! New issues coming soon!</p>
			</div>
		</>
	);
}
