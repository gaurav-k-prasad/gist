"use client";

import { AppSidebar } from "@/components/app-sidebar";
import FolderBreadcrumbs from "@/components/folder-breadcrumbs";
import FolderDisplay from "@/components/folder-display";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useFilesFolders } from "@/hooks/useFilesFolders";
import { Folder as FolderType } from "@/types/files-folders";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Folder() {
  const folderId = useParams().folderId?.toString() as string;
  const { files, folders, setFiles, setFolders } = useFilesFolders();
  const [folderInfo, setFolderInfo] = useState<FolderType>();
  const [map, setMap] = useState(new Map());

  useEffect(() => {
    const f = async () => {
      const params = new URLSearchParams();
      params.append("folderId", folderId);

      try {
        const response = await fetch("/api/fs?" + params.toString(), {
          method: "GET",
        });

        const res = await response.json();
        console.log(res);
        setFolders(res.data.folders);
        setFiles(res.data.files);
        setFolderInfo(res.data.currFolder);

        // ! WARNING
        setFiles([
          {
            folderId: 1,
            id: 3,
            name: "new file",
            path: "/path",
            s3url: "/s3",
            userId: 3,
          },
          {
            folderId: 1,
            id: 4,
            name: "new file2lkasdjfks alksjdfklajs;dflkasjdf",
            path: "/path",
            s3url: "/s3",
            userId: 3,
          },
        ]);
      } catch {
        toast.error("Data fetching failed");
      }
    };
    f();
  }, [folderId, setFolders, setFiles]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <FolderBreadcrumbs currFolder={folderInfo} />
          </div>
        </header>
        <FolderDisplay files={files} folders={folders} />
      </SidebarInset>
    </SidebarProvider>
  );
}
