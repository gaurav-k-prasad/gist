"use client";

import { AppSidebar } from "@/components/app-sidebar";
import FolderBreadcrumbs from "@/components/folder-breadcrumbs";
import FolderDisplay from "@/components/folder-display";
import NewItemDropdown from "@/components/new-item-dropdown";
import { Dialog } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useFilesFolders } from "@/hooks/useFilesFolders";
import { Folder as FolderType } from "@/types/files-folders";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Folder() {
  const { files, folders, setFiles, setFolders } = useFilesFolders();
  const [folderInfo, setFolderInfo] = useState<FolderType>();
  const { data: session, status } = useSession();
  const [folderId, setFolderId] = useState<string>("");

  useEffect(() => {
    const f = async () => {
      const params = new URLSearchParams();
      params.append("folderId", folderId);

      try {
        const response = await fetch(`/api/fs?folderId=${folderId}`, {
          method: "GET",
        });

        const res = await response.json();
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
            name: "new file2",
            path: "/path",
            s3url: "/s3",
            userId: 3,
          },
        ]);
      } catch {
        toast.error("Data fetching failed");
      }
    };

    if (status === "authenticated" && folderId.length > 0) {
      f();
    }
  }, [folderId, setFolders, setFiles, status]);

  useEffect(() => {
    const rootId = session?.user?.rootFolderId;
    if (status === "authenticated" && rootId !== undefined && rootId !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFolderId(rootId.toString());
    }
  }, [status, session]);

  if (status != "authenticated") {
    return <></>;
  }

  return (
    <SidebarProvider>
      <Dialog>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <FolderBreadcrumbs
                currFolder={folderInfo}
                setFolderId={setFolderId}
              />
            </div>
          </header>
          <FolderDisplay
            files={files}
            folders={folders}
            setFolderId={setFolderId}
          />
          <div className="fixed max-md:right-5 right-10 max-md:bottom-5 bottom-10">
            <NewItemDropdown
              folderDetails={{
                folderId: folderInfo?.id || -1,
                folderName: folderInfo?.name || "Invalid",
              }}
              setFilesFolders={{ setFiles, setFolders }}
            />
          </div>
        </SidebarInset>
      </Dialog>
    </SidebarProvider>
  );
}
