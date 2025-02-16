"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutButton, useUser } from "@clerk/clerk-react";
import { ChevronsLeftRight } from "lucide-react";

const UserItems = () => {
  const { user } = useUser();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            className="flex p-4 items-start rounded-lg text-sm hover:bg-primary/5"
            role="button"
          >
            <div className="gap-x-2 items-center flex max-w-[200px]">
              <Avatar className="h-5 w-5">
                <AvatarImage src={user?.imageUrl} />
              </Avatar>
              <span className="ml-1 text-start line-clamp-1 font-medium">
                {user?.firstName && user?.lastName ? `${user?.firstName} ${user?.lastName}` : user?.emailAddresses[0].emailAddress.split("@")[0]}
              </span>
              <ChevronsLeftRight className="rotate-90 ml-2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-80"
          align="start"
          alignOffset={11}
          forceMount
        >
          <div className="flex flex-col space-y-4 p-2">
            <p className="text-sm font-medium leading-none text-muted-foreground">
              {user?.emailAddresses[0].emailAddress}
            </p>

            <div className="flex items-center gap-x-2">
              <div className="rounded-md bg-secondary p-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.imageUrl} />
                </Avatar>
              </div>

              <div className="space-y-1">
                <p className="text-sm line-clamp-1">
                  {user?.emailAddresses[0].emailAddress.split("@")[0]}
                </p>
              </div>
            </div>
          </div>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            asChild
            className="w-full cursor-pointer text-muted-foreground"
          >
            <SignOutButton>Logout</SignOutButton>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default UserItems;
