"use client";

import { SidebarGroup } from "@/components/ui/sidebar";
import { FileType, FolderType } from "@/types/files-folders";
import SidebarFolder from "./ui/sidebar-folder";

export function NavMain({
  folderInfo,
  folders,
  files,
  currFolderId
}: {
  folderInfo?: FolderType;
  folders: FolderType[];
  files: FileType[];
  currFolderId: string
}) {
  return (
    <SidebarGroup className="pt-5">
      <SidebarFolder
        folderInfo={folderInfo}
        currFiles={files}
        currFolders={folders}
        currFolderId={currFolderId}
      />
    </SidebarGroup>
  );
}
