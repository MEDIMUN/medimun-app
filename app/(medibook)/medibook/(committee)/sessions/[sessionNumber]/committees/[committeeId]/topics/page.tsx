import prisma from "@/prisma/client";
import { notFound } from "next/navigation";
import { SearchParamsButton, SearchParamsDropDropdownItem, TopBar } from "@/app/(medibook)/medibook/client-components";
import { authorize, authorizeChairCommittee, s } from "@/lib/authorize";
import { auth } from "@/auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Button } from "@/components/button";
import { processMarkdownPreview } from "@/lib/text";
import Paginator from "@/components/pagination";
import { Ellipsis } from "lucide-react";
import { MainWrapper } from "@/components/main-wrapper";
import { connection } from "next/server";
import { Suspense } from "react";

export default function Page(props) {
  return (
    <Suspense>
      <Topics {...props} />
    </Suspense>
  );
}

export async function Topics(props) {
  await connection();
  const params = await props.params;
  const authSession = await auth();
  if (!authSession) notFound();
  const isManagement = authorize(authSession, [s.management]);
  const selectedCommittee = await prisma.committee
    .findFirstOrThrow({
      where: {
        OR: [{ slug: params.committeeId }, { id: params.committeeId }],
        session: { number: params.sessionNumber, ...(!isManagement ? { isVisible: true } : {}) },
        ...(isManagement ? {} : { isVisible: true }),
      },
      include: { Topic: true },
    })
    .catch(notFound);
  const isChairOfCommittee = authorizeChairCommittee(authSession?.user.currentRoles, selectedCommittee.id);
  const topics = selectedCommittee?.Topic;

  const howManyTOpicsHaveDescription = topics.filter((topic) => topic.description).length;

  return (
    <>
      <TopBar
        hideBackdrop
        hideSearchBar
        title="Topics"
        buttonText={selectedCommittee.name}
        buttonHref={`/medibook/sessions/${params.sessionNumber}/committees/${params.committeeId}`}
      >
        {isManagement && (
          <SearchParamsButton searchParams={{ "create-topic": selectedCommittee.id }}>Create Topic</SearchParamsButton>
        )}
      </TopBar>
      <MainWrapper>
        {!!topics.length && (
          <Table>
            <TableHead>
              <TableRow>
                {!(!isManagement && !isChairOfCommittee && !howManyTOpicsHaveDescription) && (
                  <TableHeader>
                    <span className="sr-only">Actions</span>
                  </TableHeader>
                )}
                <TableHeader>Topic</TableHeader>
                <TableHeader>Description</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {topics.map((topic) => (
                <TableRow className="max-w-max" key={topic.id}>
                  {!(!isManagement && !isChairOfCommittee && !topic.description) && (
                    <TableCell>
                      {isChairOfCommittee || isManagement ? (
                        <Dropdown>
                          <DropdownButton plain aria-label="More options">
                            <Ellipsis width={18} />
                          </DropdownButton>
                          <DropdownMenu anchor="bottom end">
                            {topic.description && (
                              <DropdownItem
                                href={`/medibook/sessions/${params.sessionNumber}/committees/${selectedCommittee.slug || selectedCommittee.id}/topics/${
                                  topic.id
                                }`}
                              >
                                View
                              </DropdownItem>
                            )}
                            <SearchParamsDropDropdownItem searchParams={{ "edit-topic": topic.id }}>
                              Edit Topic
                            </SearchParamsDropDropdownItem>
                            {isManagement && (
                              <SearchParamsDropDropdownItem searchParams={{ "delete-topic": topic.id }}>
                                Delete Topic
                              </SearchParamsDropDropdownItem>
                            )}
                          </DropdownMenu>
                        </Dropdown>
                      ) : (
                        <Button
                          disabled={!topic.description}
                          href={`/medibook/sessions/${params.sessionNumber}/committees/${selectedCommittee.slug || selectedCommittee.id}/topics/${
                            topic.id
                          }`}
                          plain
                        >
                          Details
                        </Button>
                      )}
                    </TableCell>
                  )}
                  <TableCell>{topic.title}</TableCell>
                  <TableCell>{topic.description ? processMarkdownPreview(topic.description) : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Paginator totalItems={topics.length} itemsPerPage={10} itemsOnPage={topics.length} />
      </MainWrapper>
    </>
  );
}
