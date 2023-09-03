import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="min-h-auto max-w-full overflow-x-hidden p-5">
			<div className="min-h-auto mx-auto mt-5 max-w-[1200px] gap-[24px] ">
				<h1 className="font-md text-3xl font-bold tracking-tight">
					This page does not exist. <br />
				</h1>
				<Button>
					<Link href={`/medibook`}>Back Home</Link>
				</Button>
			</div>
		</div>
	);
}
