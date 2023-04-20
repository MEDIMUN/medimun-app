"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { Skeleton } from "@components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function RegisterButton() {
	const { data, error, refetch, isError, isLoading } = useQuery({
		queryKey: ["user"],
		queryFn: async () => {
			return (await axios.get("/api/sessions")).data;
		},
	});
	if (isLoading) {
		return (
			<Button disabled className="ml-5">
				<Skeleton className="h-[15px] w-[100px]" />
			</Button>
		);
	}

	if (isError) {
		return (
			<Button disabled className="ml-5">
				<Skeleton className="h-[15px] w-[100px] bg-red-500" />
			</Button>
		);
	}
	return (
		<Link className="flex justify-center align-left h-[20px]" href="/sessions">
			<Button className="m-0">About Session {data[0]}</Button>
		</Link>
	);
}
