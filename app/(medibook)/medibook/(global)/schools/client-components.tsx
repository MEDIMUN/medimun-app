"use client";

import { useRouter } from "next/navigation";
import { updateSearchParams } from "@/lib/search-params";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Button } from "@/components/button";
import { Ellipsis } from "lucide-react";

export function OptionsDropdown({ school }) {
	const router = useRouter();
	return (
		<Dropdown>
			<DropdownButton plain aria-label="More options">
				<Ellipsis width={18} />
			</DropdownButton>
			<DropdownMenu>
				<DropdownItem onClick={() => router.push(`/medibook/schools/${school.slug || school.id}`)}>View School Page</DropdownItem>
				<DropdownItem
					onClick={() => {
						updateSearchParams({ "edit-school": school.id }, router);
						router.refresh();
					}}>
					Edit & View Details
				</DropdownItem>
				<DropdownItem href={`/medibook/schools/${school.slug || school.id}/students`}>View Students</DropdownItem>
				<DropdownItem
					onClick={() => {
						updateSearchParams({ "delete-school": school.id }, router);
						router.refresh();
					}}>
					Delete
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
}

export function EditDeleteSchoolButtons({ schoolId, schoolSlug, isDirector, isManagement }) {
	const router = useRouter();

	const buttons = [
		{
			children: "View Students",
			href: `/medibook/schools/${schoolSlug || schoolId}/students`,
			isVisible: isDirector || isManagement,
			color: "light",
		},
		{
			children: "Edit School",
			onClick: () => {
				updateSearchParams({ "edit-school": schoolId }, router);
				router.refresh();
			},
			isVisible: isManagement,
			color: "light",
		},
		{
			children: "Delete School",
			onClick: () => {
				updateSearchParams({ "delete-school": schoolId }, router);
				router.refresh();
			},
			isVisible: isManagement,
			color: "red",
		},
	];

	const visibleButtons = buttons.filter((button) => button.isVisible).map(({ isVisible, ...button }) => button);

	return (
		<>
			<div className="grid w-full gap-2 md:hidden">
				{visibleButtons.map((button, index) => (
					<Button key={index} {...button} />
				))}
			</div>
			<div className="hidden md:block">
				<Dropdown>
					<DropdownButton color="light" aria-label="More options">
						<Ellipsis width={18} />
					</DropdownButton>
					<DropdownMenu>
						{visibleButtons.map((button, index) => (
							<DropdownItem key={index} {...button} />
						))}
					</DropdownMenu>
				</Dropdown>
			</div>
		</>
	);
}
