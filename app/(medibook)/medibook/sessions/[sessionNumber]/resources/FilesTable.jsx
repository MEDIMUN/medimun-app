"use client";

import { authorize, s } from "@/lib/authorize";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Link } from "@nextui-org/react";
import * as SolarIconSet from "solar-icon-set";

export default function FilesTable(props) {
	return (
		<Table className="min-w-max" aria-label="Example static collection table">
			<TableHeader>
				<TableColumn>NAME</TableColumn>
				<TableColumn>DESCRIPTION</TableColumn>
				<TableColumn>ACTIONS</TableColumn>
			</TableHeader>
			<TableBody>
				{props.files.map((file) => (
					<TableRow key={file.id}>
						<TableCell>{file.name}</TableCell>
						<TableCell>{file.description}</TableCell>
						<TableCell>
							<Button isIconOnly className="bgn ml-auto">
								<SolarIconSet.Eye iconStyle="Outline" size={24} />
							</Button>
							{authorize(props.session, [s.management]) && (
								<Button color="danger" isIconOnly className="ml-2">
									<SolarIconSet.TrashBinMinimalistic iconStyle="Outline" size={24} />
								</Button>
							)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
