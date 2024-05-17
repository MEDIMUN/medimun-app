"use client";


import React from "react";
import { Avatar, AvatarGroup, AvatarIcon } from "@nextui-org/avatar";
import { cn } from "@/lib/cn";

const TeamAvatar = React.forwardRef(
   ( { name, className, classNames = {}, ...props }, ref ) =>
      <Avatar
         { ...props }
         ref={ ref }
         classNames={ {
            ...classNames,
            base: cn( "bg-transparent border border-divider", classNames?.base, className ),
            name: cn( "text-default-500 text-[0.6rem] font-semibold", classNames?.name )
         } }
         name={ name }
         radius="md"
         size="sm" />


);

TeamAvatar.displayName = "TeamAvatar";

export default TeamAvatar;