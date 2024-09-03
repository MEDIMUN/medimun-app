/* "use client";

import { Checkbox } from "@nextui-org/checkbox";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@nextui-org/table";
import { User } from "@nextui-org/user";
import { useSearchParams } from "next/navigation";
import { Key } from "react";

export default function RollCallTable({ rollCalls }) {
	const delegates = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	const searchParams = useSearchParams();
	return (
		<Table classNames={{ thead: "[&>tr]:first:shadow-none", td: "min-w-[120px]" }} isHeaderSticky isCompact isStriped aria-label="Example static collection table">
			<TableHeader className="shadow-none">
				<TableColumn>DELEGATE</TableColumn>
				{rollCalls.map((_rollCall: any, index: Key) => {
					return (
						<TableColumn key={index} className="uppercase">
							<p className="text-center">{_rollCall?.name || _rollCall?.index + 1}</p>
						</TableColumn>
					);
				})}
			</TableHeader>
			<TableBody>
				{delegates.map((_delegate, index: Key) => {
					return (
						<TableRow key={`${index}${searchParams.get("day")}`}>
							<TableCell className="">
								<User className="min-w-max" avatarProps={{ size: "sm", isBordered: false }} name="Berzan Ozejder" description="Cyprus"></User>
							</TableCell>
							{rollCalls.map((_rollCall: any, index: Key) => {
								return (
									<TableCell className="" key={`${index}${searchParams.get("day")}`}>
										<div className="flex justify-center">
											<Checkbox radius="full" classNames={{ wrapper: "w-8 h-8 rounded-xl m-0" }} color="success" />
										</div>
									</TableCell>
								);
							})}
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
 */
