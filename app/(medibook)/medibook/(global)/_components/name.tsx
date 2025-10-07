"use client";

import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { useSession } from "next-auth/react";
import DaphneAdvert from "@/public/assets/daphne-advert.png";
import MediBookWelcome from "@/public/assets/medibook-welcome.webp";
import Image from "next/image";

export function NameDisplay() {
  const { data: authSession, status } = useSession();
  const officialName = authSession?.user?.officialName;
  const displayName = authSession?.user?.displayName;
  const preferredName = displayName?.split(" ")[0] || officialName;
  const userId = authSession?.user?.id;
  const greeting =
    new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  if (status === "authenticated" && userId)
    return (
      <>
        <Heading as={"p"}>
          {greeting}, {preferredName}
        </Heading>
        <Text as={"p"}>
          Your User ID is {userId.slice(0, 4)}-{userId.slice(4, 8)}-{userId.slice(8, 12)}
        </Text>
      </>
    );

  return (
    <>
      <Heading as="p">
        <span className="h-8 w-64 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800"></span>
      </Heading>
      <Text as={"p"}>
        <span className="mt-1 flex h-5 w-64 animate-pulse rounded-md bg-gray-100 delay-500 dark:bg-gray-800"></span>
      </Text>
    </>
  );
}

export function WelcomeImage() {
  const { data: authSession, status } = useSession();
  const userId = authSession?.user?.id;
  const isDaphne = userId === "356217598077";

  if (status === "authenticated" && userId)
    return (
      <div className="w-full overflow-hidden rounded-xl shadow-md">
        <Image
          alt="Welcome to MediBook."
          quality={100}
          className="!relative object-cover"
          src={isDaphne ? DaphneAdvert : MediBookWelcome}
          fill
        />
      </div>
    );

  return (
    <div className="w-full overflow-hidden rounded-xl shadow-md">
      <Image alt="Welcome to MediBook." quality={100} className="!relative object-cover" src={MediBookWelcome} fill />
    </div>
  );
}
