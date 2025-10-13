import { authorizedToEditAnnouncement } from "@/app/(medibook)/medibook/@announcement/default";
import { SearchParamsDropDropdownItem } from "@/app/(medibook)/medibook/client-components";
import { auth } from "@/auth";
import { Button } from "@/components/button";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { FastLink } from "@/components/fast-link";
import { MainWrapper } from "@/components/main-wrapper";
import Paginator from "@/components/pagination";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authorize, s } from "@/lib/authorize";
import { processMarkdownPreview } from "@/lib/text";
import { connection } from "next/server";

const itemsPerPage = 10;

export async function AnnouncementsTable({
  title,
  announcements,
  baseUrl,
  totalItems,
  buttonHref,
  buttonText,
  showPublishButton,
}) {
  await connection();
  const authSession = await auth();
  const isManagement = authorize(authSession, [s.management]);
  return (
    <>
      <TopBar buttonHref={buttonHref} buttonText={buttonText} title={title || "Announcements"}>
        {showPublishButton && <Button href={baseUrl + "/publish"}>Publish</Button>}
      </TopBar>
      <MainWrapper>
        {!!announcements.length && (
          <ul className="grid-auto-rows-[minmax(200px,_1fr)] grid gap-4 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
            {announcements.map((announcement, index) => {
              const fullName =
                announcement.user.displayName ||
                `${announcement.user.officialName} ${announcement.user.officialSurname}`;
              const url = `${baseUrl}/${announcement.id}${announcement.slug ? "/" : ""}${announcement.slug ? announcement.slug : ""}`;
              const isTimeSame = announcement.time.toLocaleTimeString() == announcement.editTime.toLocaleTimeString();
              return (
                <Card key={index} className="flex h-full min-h-[200px] flex-col">
                  <FastLink href={url}>
                    <CardHeader>
                      <CardTitle>{announcement.title}</CardTitle>
                      <CardDescription>
                        {isTimeSame ? (
                          <span className="">{announcement.time.toLocaleString("uk").replace(",", " -")}</span>
                        ) : (
                          <span className="">
                            Edited {announcement.editTime.toLocaleString("uk").replace(",", " -")}
                          </span>
                        )}
                        {" • by "}
                        <span>
                          {announcement?.privacy === "ANONYMOUS" &&
                            (isManagement ? `${fullName} (Anonymous)` : "Anonymous")}
                          {announcement?.privacy === "BOARD" &&
                            (isManagement ? `${fullName} (Anonymous - Board of Directors)` : "Board of Directors")}
                          {announcement?.privacy === "NORMAL" && fullName}
                          {announcement?.privacy === "SECRETARIAT" &&
                            (isManagement ? `${fullName} (Secretariat)` : "Secretariat")}
                        </span>
                      </CardDescription>
                    </CardHeader>
                  </FastLink>
                  <FastLink href={url}>
                    <CardContent className="mt-auto">
                      <span className="line-clamp-2">{processMarkdownPreview(announcement.markdown)}</span>
                    </CardContent>
                  </FastLink>
                  <CardFooter className="mt-auto flex flex-1 gap-1">
                    {authorizedToEditAnnouncement(authSession, announcement) ? (
                      <Dropdown>
                        <DropdownButton className="ml-auto mt-auto max-h-max" aria-label="More options">
                          Options
                        </DropdownButton>
                        <DropdownMenu anchor="bottom end">
                          <DropdownItem href={url}>View</DropdownItem>
                          <SearchParamsDropDropdownItem
                            url={url}
                            searchParams={{ "edit-announcement": announcement.id }}
                          >
                            Edit
                          </SearchParamsDropDropdownItem>
                          <SearchParamsDropDropdownItem searchParams={{ "delete-announcement": announcement.id }}>
                            Delete
                          </SearchParamsDropDropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    ) : (
                      <FastLink className="ml-auto" href={url}>
                        <Button className="ml-auto mt-auto">View</Button>
                      </FastLink>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </ul>
        )}
        <Paginator itemsOnPage={announcements.length} totalItems={totalItems} itemsPerPage={itemsPerPage} />
      </MainWrapper>
    </>
  );
}
