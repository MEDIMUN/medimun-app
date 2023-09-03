import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authorize, s } from "@/lib/authorize";
import { redirect } from "next/navigation";

export default async function SearchBar(props) {
	const session = await getServerSession(authOptions);
	if (!session || session.isDisabled) redirect("/medibook/signout");

	if (authorize(session, [s.sd, s.admin])) {
		return (
			<>
				<div className="mx-auto flex max-w-[1200px] flex-row">
					<Input type="search" placeholder="Search for older sessions" className="text-md w-full rounded-[4px]" />
					<Button className="ml-2 w-[120px]">Add User</Button>
				</div>
			</>
		);
	}
}
