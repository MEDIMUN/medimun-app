import { TitleBar, e as s } from "@/components/medibook/TitleBar";
import Drawer from "./Drawer";

export default function Page() {
	return (
		<>
			<Drawer />
			<TitleBar button1text="Add Place" button1href="/medibook/places?add" button1roles={[s.management]} title="Places" />
		</>
	);
}
