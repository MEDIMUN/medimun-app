import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="p-5 min-h-auto max-w-full overflow-x-hidden">
			<div className="mt-5 max-w-[1200px] gap-[24px] mx-auto min-h-auto ">
				<h1 className="font-md text-3xl font-bold tracking-tight">
					This announcement could not be found.
				</h1>
				<Button>
					<Link href={`/medibook/announcements`}>Back to announcements</Link>
				</Button>
			</div>
		</div>
	);
}
