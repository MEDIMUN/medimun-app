import { Badge } from "@/components/badge";
import { Divider } from "@/components/divider";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Link } from "@/components/link";
import { cn } from "@/lib/cn";
import { romanize } from "@/lib/romanize";
import prisma from "@/prisma/client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { authorize, s } from "@/lib/authorize";
import { auth } from "@/auth";
import Paginator from "@/components/pagination";
import { SearchParamsButton, TopBar } from "@/app/(medibook)/medibook/client-components";
import { Fragment, Suspense } from "react";
import { Ellipsis } from "lucide-react";
import { MainWrapper } from "@/components/main-wrapper";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "All Conference Sessions",
};

const sessionsPerPage = 6;

export default function Page(props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Sessions {...props} />
    </Suspense>
  );
}

export async function Sessions(props) {
  await connection();
  const searchParams = await props.searchParams;
  const currentPage = parseInt(searchParams.page) || 1;
  const query = searchParams.search || "";
  const authSession = await auth();
  const isManagement = authorize(authSession, [s.management]);

  const whereObject = {
    ...(isManagement ? {} : { isVisible: true }),
    OR: [
      { number: { contains: query, mode: "insensitive" } },
      { theme: { contains: query, mode: "insensitive" } },
      { subTheme: { contains: query, mode: "insensitive" } },
    ],
  };

  let sessions = await prisma.session
    .findMany({
      where: whereObject,
      take: sessionsPerPage,
      include: {
        Day: {
          orderBy: { date: "asc" },
          where: { type: "CONFERENCE" },
          include: { location: true },
        },
      },
      skip: (currentPage - 1) * sessionsPerPage,
      orderBy: [{ isMainShown: "desc" }, { numberInteger: "desc" }],
    })
    .catch(notFound);

  let numberOfSessions = await prisma.session.count({ where: whereObject }).catch(notFound);

  return (
    <>
      <TopBar
        title="All Sessions"
        buttonHref="/medibook"
        buttonText="Home"
        defaultSort="nameasc"
        searchText="Search sessions..."
        hideSearchBar={false}
      >
        {authorize(authSession, [s.admins, s.sd]) && (
          <SearchParamsButton
            searchParams={{
              "create-session": true,
            }}
          >
            Create New Session
          </SearchParamsButton>
        )}
      </TopBar>
      <MainWrapper>
        {!!sessions.length && (
          <ul>
            {sessions.map((session, index) => {
              const firstDay = session?.Day[0]?.date;
              const firstDayDate = firstDay?.toLocaleString("en-GB").slice(0, 10);
              const lastDayDate = session?.Day[session?.Day.length - 1]?.date.toLocaleString("en-GB").slice(0, 10);
              const location = session?.Day[0]?.location?.name;
              const romanized = romanize(session?.numberInteger);
              return (
                <Fragment key={session.id}>
                  <li
                    className={cn(
                      "bg-cover",
                      session?.isMainShown &&
                        "border-primary mb-6 overflow-hidden rounded-3xl border text-zinc-800 shadow-md duration-300 hover:shadow-lg",
                    )}
                    key={session.id}
                  >
                    {!!index && !session?.isMainShown && <Divider soft={index > 0} />}
                    <div
                      className={cn(
                        "flex items-center justify-between",
                        session?.isMainShown && "bg-white bg-opacity-60 pl-6 pr-4",
                      )}
                    >
                      <div key={session.id} className="flex gap-6 py-6">
                        {!session.isMainShown && (
                          <div className="w-[85.33px] shrink-0">
                            <Link href={`/medibook/sessions/${session?.number}`} aria-hidden="true">
                              {session?.cover ? (
                                <div
                                  style={{
                                    backgroundImage: `url(/api/sessions/${session.id}/cover)`,
                                  }}
                                  className={`flex aspect-square justify-center rounded-lg bg-cover align-middle shadow`}
                                >
                                  <p className="my-auto translate-y-1 font-[GilroyLight] text-5xl font-light text-white drop-shadow">
                                    {session.number}
                                  </p>
                                </div>
                              ) : (
                                <div
                                  className={`bg-primary flex aspect-square justify-center rounded-3xl bg-cover align-middle shadow-sm`}
                                >
                                  <p className="my-auto translate-y-1 font-[GilroyLight] text-5xl font-light text-white drop-shadow">
                                    {session.number}
                                  </p>
                                </div>
                              )}
                            </Link>
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <div className="text-base/6 font-semibold">
                            <Link href={`/medibook/sessions/${session?.number}`}>
                              {session.theme ? (
                                <>
                                  {session.theme} <Badge className="font-light">Session {romanized}</Badge>
                                </>
                              ) : (
                                `Session ${romanized}`
                              )}
                              {!session.isVisible && (
                                <>
                                  {" "}
                                  <Badge color="red">Hidden</Badge>
                                </>
                              )}
                            </Link>
                          </div>
                          <div className="text-xs/6 text-zinc-500">
                            {firstDayDate && lastDayDate ? `${firstDayDate} to ${lastDayDate}` : "No dates set"}
                          </div>
                          <div className="text-xs/6 text-zinc-500">
                            {location ? `At ${location}` : "No location set"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Dropdown>
                          <DropdownButton plain aria-label="More options">
                            <Ellipsis width={18} />
                          </DropdownButton>
                          <DropdownMenu anchor="bottom end">
                            <DropdownItem href={`/medibook/sessions/${session?.number}`}>View</DropdownItem>
                            {authorize(authSession, [s.admins, s.sd]) && (
                              <DropdownItem href={`/medibook/sessions/${session?.number}/settings`}>Edit</DropdownItem>
                            )}
                            {authorize(authSession, [s.admins, s.sd]) && (
                              <DropdownItem href={`/medibook/sessions/${session?.number}/settings`}>
                                Delete
                              </DropdownItem>
                            )}
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </div>
                  </li>
                </Fragment>
              );
            })}
          </ul>
        )}
        <Paginator itemsOnPage={sessions.length} itemsPerPage={sessionsPerPage} totalItems={numberOfSessions} />
      </MainWrapper>
    </>
  );
}
