"use client";

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command";
import React from "react";
import { useRouter } from "next/navigation";

export function CommandMenu() {
	const [open, setOpen] = React.useState(false);

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && e.metaKey) {
				setOpen((open) => !open);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	const router = useRouter();

	return (
		<CommandDialog open={open} onOpenChange={setOpen}>
			<CommandInput placeholder="Type a command or search..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Pages">
					<CommandItem onClick={router.push("/")}>Home</CommandItem>
					<CommandItem>MediBook</CommandItem>
					<CommandItem onClick={router.push("/about")}>About</CommandItem>
					<CommandItem>Feedback</CommandItem>
					<CommandItem>Register</CommandItem>
					<CommandItem>Register</CommandItem>
				</CommandGroup>
				<CommandGroup heading="Commands">
					<CommandItem>Open Menu</CommandItem>
					<CommandItem>Menu</CommandItem>
					<CommandItem>About</CommandItem>
					<CommandItem>Feedback</CommandItem>
					<CommandItem>Register</CommandItem>
					<CommandItem></CommandItem>
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	);
}
