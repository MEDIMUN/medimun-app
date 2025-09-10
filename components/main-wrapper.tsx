import { cn } from "@/lib/utils";

export function MainWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
	return <div className={cn("md:p-10 p-4 max-w-384 mx-auto flex flex-col gap-4", className)}>{children}</div>;
}
