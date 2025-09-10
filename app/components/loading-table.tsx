import { Dropdown, DropdownButton } from "@/components/dropdown";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Button } from "@/components/ui/button";
import { arrayFromNumber } from "@/lib/array-from-number";
import { cn } from "@/lib/cn";
import { Ellipsis } from "lucide-react";

export function LoadingTable({ columns = ["", "", "", "", ""], includeDropdown = true, rows = 10 }) {
	return (
		<Table className="w-full">
			<TableHead>
				<TableRow>
					{includeDropdown && <TableHeader></TableHeader>}
					{columns.map((column, index) => (
						<TableHeader key={index}>{column}</TableHeader>
					))}
				</TableRow>
			</TableHead>
			<TableBody>
				{arrayFromNumber(rows).map((_, index) => (
					<TableRow key={index}>
						{includeDropdown && (
							<TableCell key={index + "dropdown"}>
								<Dropdown>
									<DropdownButton className="m-0!" plain>
										<Ellipsis width={18} />
									</DropdownButton>
								</Dropdown>
							</TableCell>
						)}
						{columns.map((_, index) => (
							<TableCell key={index}>
								<div className={cn("flex w-full items-center space-x-2 min-w-[300px]", index === 0 ? "w-[400px]" : "")}>
									<div className="flex-1 min-w-full h-4 bg-gray-300 rounded animate-pulse"></div>
								</div>
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
