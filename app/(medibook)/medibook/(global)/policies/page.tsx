import { auth } from "@/auth";
import { SearchParamsButton, SearchParamsDropDropdownItem, TopBar } from "../../client-components";
import { authorize, s } from "@/lib/authorize";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Button } from "@/components/button";
import Paginator from "@/components/pagination";
import { Ellipsis } from "lucide-react";
import { MainWrapper } from "@/components/main-wrapper";

export default async function PoliciesPage(props) {
	const searchParams = await props.searchParams;
	const authSession = await auth();
	const isManagement = authorize(authSession, [s.director, s.sd]);
	const query = searchParams["search"];
	const page = parseInt(searchParams["page"]) || 1;

	const policies = await prisma.policy
		.findMany({
			where: { title: { contains: query, mode: "insensitive" } },
			orderBy: { title: "asc" },
			skip: (page - 1) * 10,
			take: 10,
		})
		.catch(notFound);

	const totalItems = await prisma.policy.count({
		where: { title: { contains: query, mode: "insensitive" } },
	});

	return (
		<>
			<TopBar key="TopBar" buttonHref="/medibook" buttonText="Home" title="Conference & Digital Policies">
				{isManagement && (
					<SearchParamsButton
						searchParams={{
							"create-policy": true,
						}}>
						Create New
					</SearchParamsButton>
				)}
			</TopBar>
			<MainWrapper>
				{!!policies.length && (
					<Table>
						<TableHead>
							<TableRow>
								<TableHeader>
									<span className="sr-only">Actions</span>
								</TableHeader>
								<TableHeader>Policy</TableHeader>
								<TableHeader>Description</TableHeader>
							</TableRow>
						</TableHead>
						<TableBody>
							{policies.map((policy) => (
								<TableRow key={policy.id}>
									<TableCell>
										{isManagement ? (
											<Dropdown>
												<DropdownButton className="my-auto max-h-max" plain aria-label="More options">
													<Ellipsis width={18} />
												</DropdownButton>
												<DropdownMenu anchor="bottom end">
													<DropdownItem href={`/medibook/policies/${policy.slug}`}>View</DropdownItem>
													<SearchParamsDropDropdownItem searchParams={{ "edit-policy": policy.id }}>Edit</SearchParamsDropDropdownItem>
													<SearchParamsDropDropdownItem searchParams={{ "delete-policy": policy.id }}>Delete</SearchParamsDropDropdownItem>
												</DropdownMenu>
											</Dropdown>
										) : (
											<Button plain href={`/medibook/policies/${policy.slug}`}>
												View
											</Button>
										)}
									</TableCell>
									<TableCell>{policy.title}</TableCell>
									<TableCell className="w-full">{policy.description || "-"}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
				<Paginator totalItems={totalItems} itemsOnPage={policies.length} />
			</MainWrapper>
		</>
	);
}
