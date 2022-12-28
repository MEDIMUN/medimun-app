import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Spacer } from "@nextui-org/react";
import Layout from "../../app-components/layout";
import Pagelayout from "../../components/page/layout/layout";
import useSWR from "swr";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function SessionPage() {
	const { data: session, status } = useSession();
	const loading = status === "loading";
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	const { data, error } = useSWR("/api/sessions", fetcher);
	if (error && !data) {
		if (session) {
			return <Layout></Layout>;
		}

		if (!session) {
			return (
				<Pagelayout backgroundColor="white">
					<p> Error loading data </p>
				</Pagelayout>
			);
		}
	}

	if (session) {
		return (
			<Layout>
				<SessionPage props={props} />
			</Layout>
		);
	}

	if (!session) {
		return (
			<Pagelayout backgroundColor="white">
				<Spacer y={2.5} />
				<SessionPage props={props} />
			</Pagelayout>
		);
	}
}
