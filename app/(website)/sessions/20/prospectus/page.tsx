"use client";

export default function Page() {
	return (
		<div className="px-2 pb-8 pt-[100px] md:px-8">
			<iframe
				src="https://drive.google.com/file/d/1BxZN8H8TQKeBJAKKrOOz_HcoNfJ9o9DM/preview"
				className="min-h-screen w-full overflow-hidden rounded-lg">
				<h1>Prospectus</h1>
			</iframe>
			<div className="mt-4 w-full rounded-lg bg-zinc-100 p-4">
				<a href="https://drive.google.com/uc?export=download&id=1uCN5HUY_c--vxRsYjnAFtPdP0MSOHAZM" target="_blank" className="">
					Click to Download
				</a>
			</div>
		</div>
	);
}
