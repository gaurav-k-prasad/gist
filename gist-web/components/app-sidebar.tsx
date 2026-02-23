"use client";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { FileType, FolderType } from "@/types/files-folders";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { Dispatch, SetStateAction } from "react";

export function AppSidebar({
  folderInfo,
  folders,
  files,
  folderId,
  setFolderId,
  ...props
}: {
  folderInfo?: FolderType;
  folders: FolderType[];
  files: FileType[];
  folderId: string;
  setFolderId: Dispatch<SetStateAction<string>>
} & React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession();

  let userData = session?.user as User;
  if (status != "authenticated" || !userData) {
    userData = {
      email: "Loading...",
      name: "Loading...",
      dbId: -1,
      rootFolderId: -1,
      image: "/user.png",
    };
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain
          folderInfo={folderInfo}
          files={files}
          folders={folders}
          folderId={folderId}
          setFolderId={setFolderId}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
