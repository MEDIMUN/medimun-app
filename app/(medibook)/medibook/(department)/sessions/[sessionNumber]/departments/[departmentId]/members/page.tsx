import { TopBar, UserTooltip } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { MainWrapper } from "@/components/main-wrapper";
import Paginator from "@/components/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { authorize, authorizeManagerDepartment, authorizeMemberDepartment, s } from "@/lib/authorize";
import { UserIdDisplay } from "@/lib/display-name";
import prisma from "@/prisma/client";
import { Avatar } from "@heroui/avatar";
import { Ellipsis } from "lucide-react";
import { notFound } from "next/navigation";

const itemsPerPage = 10;

//FIX
export default async function Page(props: {
  searchParams: any;
  params: Promise<{ sessionNumber: string; departmentId: string; page: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const authSession = await auth();
  const currentPage = parseInt(searchParams.page) || 1;
  const isManagement = authorize(authSession, [s.management]);
  const query = searchParams.search || "";

  const whereObject = {
    OR: [
      { user: { officialName: { contains: query, mode: "insensitive" } } },
      { user: { officialSurname: { contains: query, mode: "insensitive" } } },
      { user: { displayName: { contains: query, mode: "insensitive" } } },
    ],
  };

  const [selectedSession, totalItems] = await prisma
    .$transaction([
      prisma.session.findFirstOrThrow({
        where: {
          number: params.sessionNumber,
          ...(isManagement ? {} : { isVisible: true }),
        },
        include: {
          department: {
            where: { OR: [{ id: params.departmentId }, { slug: params.departmentId }] },
            take: 1,
            include: {
              member: {
                where: whereObject,
                take: itemsPerPage,
                skip: (currentPage - 1) * itemsPerPage,
                include: { user: true },
              },
            },
          },
        },
      }),
      prisma.member.count({
        where: {
          ...whereObject,
          department: {
            session: { number: params.sessionNumber },
            OR: [{ id: params.departmentId }, { slug: params.departmentId }],
          },
        },
      }),
    ])
    .catch(notFound);

  const selectedDepartment = selectedSession.department[0];
  const allRoles = (authSession?.user?.currentRoles || []).concat(authSession?.user?.pastRoles || []);
  const isManagerOfDepartment = authorizeManagerDepartment(allRoles, selectedDepartment.id);
  const isMemberOfDepartment = authorizeMemberDepartment(allRoles, selectedDepartment.id);
  const isPartOfDepartment = isManagerOfDepartment || isMemberOfDepartment || isManagement;

  const delegates = selectedDepartment?.member || [];

  return (
    <>
      <TopBar
        buttonHref={`/medibook/sessions/${selectedSession.number}/committees/${selectedDepartment.slug || selectedDepartment.id}`}
        buttonText={selectedDepartment.name}
        title="Department Members"
        subheading={`${totalItems} Members`}
      />
      <MainWrapper>
        {!!selectedDepartment.member.length && (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>
                  <span className="sr-only">Actions</span>
                </TableHeader>
                <TableHeader>
                  <span className="sr-only">Avatar</span>
                </TableHeader>
                {isPartOfDepartment ? (
                  <>
                    <TableHeader>Official Name</TableHeader>
                    <TableHeader>Official Surname</TableHeader>
                    <TableHeader>Display Name</TableHeader>
                  </>
                ) : (
                  <TableHeader>Full Name</TableHeader>
                )}
                <TableHeader>User ID</TableHeader>
                {(isManagement || isManagerOfDepartment) && <TableHeader>Email</TableHeader>}
              </TableRow>
            </TableHead>
            <TableBody>
              {delegates.map((delegate) => {
                const user = delegate.user;
                return (
                  <TableRow key={delegate.id}>
                    <TableCell>
                      <Dropdown>
                        <DropdownButton plain>
                          <Ellipsis width={18} />
                        </DropdownButton>
                        <DropdownMenu>
                          <DropdownItem href={`/medibook/users/${user.username || user.id}`}>View Profile</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                    <TableCell>
                      <UserTooltip userId={user.id}>
                        <Avatar showFallback radius="md" src={`/api/users/${user.id}/avatar`} />
                      </UserTooltip>
                    </TableCell>
                    {isPartOfDepartment ? (
                      <>
                        <TableCell>{user.officialName}</TableCell>
                        <TableCell>{user.officialSurname}</TableCell>
                        <TableCell>{user.displayName || "-"}</TableCell>
                      </>
                    ) : (
                      <TableCell>{user.displayName || `${user.officialName} ${user.officialSurname}`}</TableCell>
                    )}
                    <TableCell>
                      <UserIdDisplay userId={user.id} />
                    </TableCell>
                    {(isManagement || isManagerOfDepartment) && <TableCell>{user.email}</TableCell>}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        <Paginator totalItems={totalItems} itemsPerPage={itemsPerPage} itemsOnPage={selectedDepartment.member.length} />
      </MainWrapper>
    </>
  );
}
