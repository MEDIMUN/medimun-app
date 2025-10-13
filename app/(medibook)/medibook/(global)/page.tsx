import { ActionList } from "@/app/components/actions-list";
import { NameDisplay, WelcomeImage } from "./_components/name";
import { TopBar } from "../client-components";
import { Suspense } from "react";
import { MainWrapper } from "@/components/main-wrapper";
/* import { getSocketInstance } from "@/socket/server";
 */
export default async function Home() {
  const actions = [
    {
      title: "All Sessions",
      description: "View all sessions",
      href: `/medibook/sessions`,
    },
    {
      title: "School Director Applications",
      description: "Applications for the position of School Director",
      href: `/medibook/sessions/20/apply/school-director`,
    },
    {
      title: "Global Announcements",
      description: "View all global announcements",
      href: `/medibook/announcements`,
    },
    {
      title: "Session Announcements",
      description: "View all the announcements from the latest session",
      href: `/medibook/sessions/20/announcements`,
    },
    {
      title: "Global Resources",
      description: "View all global resources",
      href: `/medibook/resources`,
    },
    {
      title: "Session Resources",
      description: "View all the resources from the latest session",
      href: `/medibook/sessions/20/resources`,
    },
    {
      title: "Policies",
      description: "View conference rules and policies.",
      href: `/medibook/policies`,
    },
    {
      title: "Account Settings",
      description: "Change your account settings and add personal information",
      href: `/medibook/account`,
    },
  ];

  return (
    <>
      <TopBar
        hideSearchBar
        hideBreadcrums
        title={
          <Suspense fallback="Loading...">
            <NameDisplay />
          </Suspense>
        }
      />
      <MainWrapper>
        {/*         <button
          onClick={async () => {
            "use server";
            const socket = getSocketInstance();
            if (socket) socket.to(`private-user-356217598077`).emit("toast.success", "Fuck you.");
          }}
          className="mb-6 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Test
        </button> */}
        <WelcomeImage />
        <ActionList actions={actions} />
      </MainWrapper>
    </>
  );
}
