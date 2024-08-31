"use client";

import { cn } from "@/lib/cn";
import { Button } from "@nextui-org/button";
import { useFormStatus } from "react-dom";

export function LoginButton({ className = "", ...others }) {
	const { pending } = useFormStatus();
	return <Button {...others} className={cn("w-full", className)} color="primary" size="md" radius="sm" type="submit" isLoading={pending}></Button>;
}
