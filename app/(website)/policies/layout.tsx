import { cn } from "@/lib/cn";
import Link from "next/link";
import { Topbar } from "../server-components";
import { PoliciesNavbar } from "./client-components";
import prisma from "@/prisma/client";

export default async function PoliciesLayout({ children }) {
	const allPolicies = await prisma.policy.findMany({ orderBy: { title: "asc" } });
	return (
		<>
			<Topbar title="Conference & Digital Policies" />
			<PoliciesNavbar allPolicies={allPolicies} />
			<main className="flex">
				<div className="mx-auto max-w-5xl px-4 py-4 font-[GilroyLight] md:py-16">{children}</div>
			</main>
		</>
	);
}
