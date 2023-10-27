import { TitleBar, e as s } from "@/components/medibook/TitleBar";

export default function Page() {
	return <TitleBar button1text="Add School" button1href="/medibook/schools?add" button1roles={[s.management]} title="Schools" />;
}
