import { cn } from "@/lib/utils";

export function MainWrapper({ children, className }) {
	return <div className={cn("md:p-10 p-4 max-w-[96rem] mx-auto flex flex-col gap-4", className)}>{children}</div>;
}
