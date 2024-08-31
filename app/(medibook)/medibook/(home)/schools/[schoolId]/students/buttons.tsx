"use client";

import { useRouter } from "next/navigation";
import { updateSearchParams } from "@/lib/searchParams";
import { Dropdown, DropdownButton, DropdownHeading, DropdownItem, DropdownLabel, DropdownMenu } from "@/components/dropdown";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/button";

export function OptionsDropdown({ username, userId }) {
	const router = useRouter();
	return (
		<Dropdown>
			<DropdownButton plain aria-label="More options">
				<EllipsisHorizontalIcon />
			</DropdownButton>
			<DropdownMenu>
				<DropdownItem
					onClick={() => {
						updateSearchParams({ edituser: userId }, router);
						router.refresh();
					}}>
					Edit User
				</DropdownItem>
				<DropdownItem
					onClick={() => {
						updateSearchParams({ unafilliatestudent: userId }, router);
						router.refresh();
					}}>
					Unafilliate Student
				</DropdownItem>
				<DropdownItem href={`/medibook/users/${username || userId}`}>View Profile</DropdownItem>
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
				updateSearchParams({ editschool: schoolId }, router);
				router.refresh();
			},
			isVisible: isManagement,
			color: "light",
		},
		{
			children: "Delete School",
			onClick: () => {
				updateSearchParams({ deleteschool: schoolId }, router);
				router.refresh();
			},
			isVisible: isManagement,
			color: "red",
		},
	];

	const visibleButtons = buttons.filter((button) => button.isVisible);

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
						<EllipsisHorizontalIcon />
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
