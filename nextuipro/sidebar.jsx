"use client";

import React, { useEffect } from "react";
import { Listbox, Tooltip, ListboxItem, ListboxSection } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const Sidebar = React.forwardRef(({ items, isCompact, defaultSelectedKey, onSelect, hideEndContent, sectionClasses: sectionClassesProp = {}, itemClasses: itemClassesProp = {}, iconClassName, className, ...props }, ref) => {
	const [selected, setSelected] = React.useState(defaultSelectedKey);
	const currentPath = usePathname();

	const sectionClasses = {
		...sectionClassesProp,
		base: cn(sectionClassesProp?.base, {
			"p-0 max-w-[44px]": isCompact,
		}),
		group: cn(sectionClassesProp?.group, {
			"flex flex-col gap-1": isCompact,
		}),
		heading: cn(sectionClassesProp?.heading, {
			hidden: isCompact,
		}),
	};

	const itemClasses = {
		...itemClassesProp,
		base: cn(itemClassesProp?.base, {
			"w-11 h-11 gap-0 p-0": isCompact,
		}),
	};

	const renderItem = React.useCallback(
		(item) => {
			return (
				<ListboxItem {...item} key={item.key} endContent={isCompact || hideEndContent ? null : item.endContent ?? null} startContent={isCompact ? null : item.icon ? <Icon className={cn("text-default-500 group-data-[selected=true]:text-foreground", iconClassName)} icon={item.icon} width={24} /> : item.startContent ?? null} title={isCompact ? null : item.title}>
					{isCompact ? (
						<Tooltip content={item.title} placement="right">
							<div className="flex w-full items-center justify-center">{item.icon ? <Icon className={cn("text-default-500 group-data-[selected=true]:text-foreground", iconClassName)} icon={item.icon} width={24} /> : item.startContent ?? null}</div>
						</Tooltip>
					) : null}
				</ListboxItem>
			);
		},
		[isCompact, hideEndContent, iconClassName, currentPath]
	);

	return (
		<Listbox
			key={isCompact ? "compact" : "default"}
			ref={ref}
			as="nav"
			className={cn("list-none", className)}
			color="default"
			itemClasses={{
				...itemClasses,
				base: cn("px-3 rounded-large h-[44px] data-[selected=true]:bg-default-100", itemClasses?.base),
				title: cn("text-small font-medium text-default-500 group-data-[selected=true]:text-foreground", itemClasses?.title),
			}}
			items={items}
			selectedKeys={[currentPath]}
			selectionMode="single"
			variant="flat"
			onSelectionChange={(keys) => {
				const key = Array.from(keys)[0];

				setSelected(key);
				onSelect?.(key);
			}}
			{...props}>
			{(item) =>
				item.items && item.items?.length > 0 ? (
					<ListboxSection key={item.key} classNames={sectionClasses} showDivider={isCompact} title={item.title}>
						{item.items.map(renderItem)}
					</ListboxSection>
				) : (
					renderItem(item)
				)
			}
		</Listbox>
	);
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
