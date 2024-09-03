import { Link } from "@nextui-org/link";
import Paginator from "../pagination";
import { Chip } from "@nextui-org/chip";
import { ButtonGroup } from "@nextui-org/button";
import { cn } from "@/lib/cn";
import { Children } from "react";

export function TableCard({ className = "", startContent = [], children, title = null, hideBorder = false, ...others }) {
	const cardFooter = children && children.find((c: { type: { name: string } }) => c?.type?.name == "TableCardFooter");
	const otherChildren =
		children && children.filter((c: { type: { name: string } }) => c?.type?.name != "TableCardFooter" && c?.type?.name != "TableCardHeader");
	const cardBodyHasChildren = children && children.find((c: { type: { name: string } }) => c?.type?.name == "TableCardBody").props.children;
	const cardBodyHasP = cardBodyHasChildren && cardBodyHasChildren?.type == "p";
	return (
		<li
			{...others}
			className={cn(
				"flex w-full flex-col gap-3 border-black/10 bg-content1/60 p-4",
				"duration-300 hover:bg-content1 dark:border-white/20 md:flex-row",
				!hideBorder && "border-b",
				className
			)}>
			<div className="flex">
				<div className="flex">{startContent && startContent}</div>
				<div className={cn("max-w-auto flex flex-col truncate", cardBodyHasChildren && "gap-3")}>
					<div
						className={cn(
							"line-clamp-2 flex gap-2 overflow-hidden truncate bg-gradient-to-br",
							"from-foreground-800 to-foreground-500 bg-clip-text text-lg",
							"font-medium tracking-tight text-transparent selection:bg-primary",
							"selection:text-white dark:to-foreground-200",
							cardBodyHasChildren && "-mb-3 -mt-[4.5px]",
							!cardBodyHasChildren && "my-auto",
							cardBodyHasP && "line-clamp-1"
						)}>
						{title as any}
					</div>
					{otherChildren}
				</div>
			</div>
			{cardFooter}
		</li>
	);
}

export function TableCardFooter({ children, className = "", ...others }) {
	return (
		<ButtonGroup
			{...others}
			variant={"" as any}
			className={cn("bg-flat my-auto h-10 rounded-lg bg-default/40 px-1 shadow-sm md:ml-auto md:rounded-full", className)}>
			{children}
		</ButtonGroup>
	);
}

export function TableCardHeader({ children, className = "", ...others }) {
	return <div className={cn("flex gap-2", className)}>{children}</div>;
}

export function TableCardBody({ children, className = "", ...others }) {
	return <div className={cn("line-clamp-2 flex flex-wrap gap-1 overflow-visible", className)}>{children}</div>;
}

export function TableCardChip({ children, className = "", variant = "flat", classNames = {}, ...others }) {
	return (
		<Chip size="sm" radius="sm" variant={variant} className={cn("h-5 px-0 shadow-sm", className)} classNames={classNames} {...others}>
			{children}
		</Chip>
	);
}

export function CardsTable({
	children,
	modals,
	emptyTitle = "",
	emptyHref = "",
	emptyDescription = "",
	currentPage,
	total = 10,
	className = "",
	...others
}) {
	children = Children.toArray(children);
	const Cards = children.filter((child: { type: { name: string } }) => child?.type?.name == "TableCard");
	const Header = children.find((child: { type: { name: string } }) => child?.type?.name == "TableCardHeader");
	return (
		<>
			{modals}
			{Header && Header}
			{!Cards.length && (
				<div className="mx-auto flex w-[300px] flex-col rounded-xl border border-content1-foreground/40 bg-content1/60 p-4 text-center">
					<p>{emptyTitle}</p>
					<Link href={emptyHref} className="mx-auto text-sm font-light" showAnchorIcon>
						{emptyDescription}
					</Link>
				</div>
			)}
			<ul className={cn("grid w-full overflow-hidden rounded-xl", className)}>{Cards}</ul>
			{!!children.length && total && currentPage && (
				<div className="mt-auto flex justify-center pt-4">
					<Paginator currentPage={currentPage} total={total} />
				</div>
			)}
		</>
	);
}
