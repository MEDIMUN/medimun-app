import { Button } from "@/components/button";
import { TestAction } from "./test.server";

export default function Tester() {
	return (
		<form className="pt-20" action={TestAction}>
			<Button type="submit" className="h-16 w-24">
				Test Verification Email
			</Button>
		</form>
	);
}
