import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { s, authorize } from "@/src/lib/authorize";
import { redirect } from "next/navigation";

export default async function SearchBar(props) {
	const session = await getServerSession(authOptions);
	!session || session.isDisabled ? redirect("/medibook/signout") : null;

	return (
		<div className="flex flex-row mx-auto max-w-[1200px]">
			<Input
				type="search"
				placeholder="Type to search for older announcements"
				className="text-md w-full rounded-[4px]"
			/>
			{authorize(session, [s.board, s.sec]) && (
				<Link href="/medibook/announcements?action=create">
					<Button className="w-[165px] ml-2">Add Announcement</Button>
				</Link>
			)}
		</div>
	);
}
