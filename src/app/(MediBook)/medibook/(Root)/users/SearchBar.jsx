import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { authorize } from "@/src/lib/authorize";
import { redirect } from "next/navigation";

export default async function SearchBar(props) {
	const session = await getServerSession(authOptions);
	session.isDisabled ? redirect("/medibook/signout") : null;
	if (authorize(session, [s.sd, s.admin])) {
		return (
			<>
				<div className="flex flex-row mx-auto max-w-[1200px]">
					<Input
						type="search"
						placeholder="Search for older sessions"
						className="text-md w-full rounded-[4px]"
					/>
					<Button className="w-[120px] ml-2">Add User</Button>
				</div>
			</>
		);
	}
}
