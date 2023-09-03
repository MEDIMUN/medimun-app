import { TestAction } from "./test.server";

export default function Tester() {
	return (
		<form className="pt-20" action={TestAction}>
			<button>Test Email</button>
		</form>
	);
}
