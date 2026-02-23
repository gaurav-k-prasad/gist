"use client";

import { SidebarGroup } from "@/components/ui/sidebar";
import { FileType, FolderType } from "@/types/files-folders";
import SidebarFolder from "./ui/sidebar-folder";
import { Dispatch, SetStateAction } from "react";

export function NavMain({
  folderInfo,
  folders,
  files,
  folderId,
  setFolderId,
}: {
  folderInfo?: FolderType;
  folders: FolderType[];
  files: FileType[];
  folderId: string;
  setFolderId: Dispatch<SetStateAction<string>>
}) {
  return (
    <SidebarGroup className="pt-5">
      <SidebarFolder
        folderInfo={folderInfo}
        currFiles={files}
        currFolders={folders}
        folderId={folderId}
        setFolderId={setFolderId}
      />
    </SidebarGroup>
  );
}
