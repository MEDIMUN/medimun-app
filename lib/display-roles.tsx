import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import { romanize } from "./romanize";

export function DisplayCurrentRoles({ user }) {
	return (
		<div className="flex gap-2">
			{user?.currentRoleNames[0]}
			<Popover>
				<PopoverTrigger>
					<span className="cursor-pointer">
						{user?.currentRoleNames.length > 1 && (
							<span className="rounded-lg bg-content3 px-2">{`+ ${user?.currentRoleNames.length - 1} other${
								user?.currentRoleNames.length > 2 ? "s" : ""
							}`}</span>
						)}
					</span>
				</PopoverTrigger>
				<PopoverContent>
					<ul className="m-2 flex flex-col gap-1">
						{user?.currentRoles.map((role, index) => (
							<li className="flex gap-2" key={index}>
								{role.name} {(role.department || role.committee || role.school) && "of"} {role.department || role.committee || role.school}
							</li>
						))}
					</ul>
				</PopoverContent>
			</Popover>
		</div>
	);
}

export function DisplayPastRoles({ user }) {
	return (
		<div className="flex gap-2">
			{user?.pastRoleNames[0]}
			<Popover>
				<PopoverTrigger>
					<span className="cursor-pointer">
						{user?.pastRoleNames.length > 1 && (
							<span className="rounded-lg bg-content3 px-2">{`+ ${user?.pastRoleNames.length - 1} other${
								user?.pastRoleNames.length > 2 ? "s" : ""
							}`}</span>
						)}
					</span>
				</PopoverTrigger>
				<PopoverContent>
					<ul className="m-2 flex flex-col gap-1">
						{user?.pastRoles.map((role, index) => (
							<li className="flex gap-2" key={index}>
								{role.name} {(role.department || role.committee || role.school) && "of"} {role.department || role.committee || role.schoolName}
								{role?.session && <span>(Session {romanize(role?.session)})</span>}
							</li>
						))}
					</ul>
				</PopoverContent>
			</Popover>
		</div>
	);
}
