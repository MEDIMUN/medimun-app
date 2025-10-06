"use client";

import {
  BadgeCheck,
  ChevronsUpDown,
  CircleUser,
  Computer,
  FileSpreadsheet,
  Home,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { signOut } from "next-auth/react";
import { FastLink } from "./fast-link";
import { cn } from "@/lib/cn";
import { useTheme } from "next-themes";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
    id?: string;
    username?: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name
                      .split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                disabled={theme == "dark"}
                onClick={() => {
                  setTheme("dark");
                  window.dispatchEvent(new Event("storage"));
                }}
                className={cn(theme == "dark" && "bg-primary !hover:bg-primary text-white")}
              >
                <Moon />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={theme == "light"}
                onClick={() => {
                  setTheme("light");
                  window.dispatchEvent(new Event("storage"));
                }}
                className={cn(theme == "light" && "bg-primary !hover:bg-primary text-white")}
              >
                <Sun />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={theme == "system"}
                onClick={() => {
                  setTheme("system");
                  window.dispatchEvent(new Event("storage"));
                }}
                className={cn(theme == "system" && "bg-primary !hover:bg-primary text-white")}
              >
                <Computer />
                System
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <FastLink href="/medibook/account">
                <DropdownMenuItem>
                  <BadgeCheck />
                  Account Settings
                </DropdownMenuItem>
              </FastLink>
              <FastLink href={`/medibook/users/${user.username || user.id}`}>
                <DropdownMenuItem>
                  <CircleUser />
                  Profile Page
                </DropdownMenuItem>
              </FastLink>
              <FastLink href="/medibook/certificates">
                <DropdownMenuItem>
                  <FileSpreadsheet />
                  My Certificates
                </DropdownMenuItem>
              </FastLink>
              <FastLink href="/home">
                <DropdownMenuItem>
                  <Home />
                  View Home Page
                </DropdownMenuItem>
              </FastLink>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
