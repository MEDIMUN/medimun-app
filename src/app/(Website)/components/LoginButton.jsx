"use client";

import { useSession } from "next-auth/react";
import { AiOutlineLogin } from "react-icons/ai";
import { Skeleton } from "@components/ui/skeleton";
import { cn } from "@/lib/utils";

import style from "./styles/LoginButton.module.css";
import Link from "next/link";

export default function LoginButton() {
	const { status } = useSession();

	if (status === "loading") {
		return (
			<div className={cn("animate-pulse", style.login)}>
				<Skeleton className="h-[30%] w-[50%]" />
			</div>
		);
	}

	if (status === "authenticated") {
		return (
			<Link href="/medibook">
				<div className={style.login}>
					<AiOutlineLogin className={style.icon} />
					<span className={style.text}>MediBook</span>
				</div>
			</Link>
		);
	}

	if (status === "unauthenticated") {
		return (
			<Link href="/login">
				<div className={style.login}>
					<AiOutlineLogin className={style.icon} />
					<span className={style.text}>Login</span>
				</div>
			</Link>
		);
	}
}
