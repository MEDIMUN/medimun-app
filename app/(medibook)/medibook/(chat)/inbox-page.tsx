import { SearchBar, SearchParamsButton, TopBar } from "../client-components";
import prisma from "@/prisma/client";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { MessageSidebar } from "./client-components";
import { TriangleAlert } from "lucide-react";
import { connection } from "next/server";
import { Suspense } from "react";

export default function InboxPage(props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Inboxes {...props} />
    </Suspense>
  );
}

export async function Inboxes({ children, searchParams }) {
  await connection();
  const authSession = await auth();

  if (!authSession) {
    notFound();
  }

  if (!authSession.user) {
    notFound();
  }

  if ((await searchParams)?.new !== "true") {
    await prisma.group.deleteMany({
      where: {
        GroupMember: {
          some: {
            userId: authSession.user.id,
          },
        },
        Message: {
          none: {},
        },
      },
    });
  }

  // Step 1: Fetch groups with latest message timestamp
  const groupsWithLatestMessage = await prisma.$queryRaw`
  SELECT g.id,
         g.name, -- Include other fields you need from Group
         MAX(m."createdAt") AS latestMessageTimestamp
  FROM "Group" g
  LEFT JOIN "Message" m ON m."groupId" = g.id
  JOIN "GroupMember" gm ON gm."groupId" = g.id
  WHERE gm."userId" = ${authSession.user.id}
  GROUP BY g.id
  ORDER BY latestMessageTimestamp DESC
`;

  // Step 2: Fetch all users for each group and combine with latest message data
  const groupsOfUser = await Promise.all(
    groupsWithLatestMessage.map(async (group) => {
      const users = await prisma.$queryRaw`
      SELECT u.id, u."officialName", u."officialSurname", u."displayName", u."username"
      FROM "User" u
      JOIN "GroupMember" gm ON gm."userId" = u.id
      WHERE gm."groupId" = ${group.id}
    `;
      return {
        ...group,
        users,
      };
    }),
  );

  return (
    <div className="h-full w-full md:w-[400px] md:border-r">
      <div className="bg-zinc-100 px-4 py-4 dark:bg-zinc-900">
        <TopBar
          hideTitle
          headerClassName="z-[1000] w-full"
          hideBackdrop
          title="Messages"
          hide
          buttonHref="/medibook"
          hideSearchBar
          buttonText="Home"
        ></TopBar>
        <div className="mb mt-1 flex w-full flex-col gap-2">
          <SearchBar className="w-[500px]! flex-1" />
          <SearchParamsButton disabled>New Group</SearchParamsButton>
        </div>
      </div>
      <div className="p-2">
        <MessageSidebar groupsOfUser={groupsOfUser} authSession={authSession} />
      </div>
    </div>
  );
}
