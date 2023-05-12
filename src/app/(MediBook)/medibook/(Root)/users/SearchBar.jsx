import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";

export default async function SearchBar(props) {
	const session = await getServerSession(authOptions);
	if (session.currentRoleNames.includes("Global Admin") || session.currentRoleNames.includes("Admin") || session.currentRoleNames.includes("Senior Director") || session.currentRoleNames.includes("Direc") || session.currentRoleNames.includes("Global Admin")) {
		return (
			<>
				<div className="flex flex-row mx-auto max-w-[1200px]">
					<Input type="search" placeholder="Search for older sessions" className="text-md w-full rounded-[4px]" />
					<Button className="w-[120px] ml-2">Add User</Button>
				</div>
			</>
		);
	}
}
