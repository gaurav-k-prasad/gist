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
import { FolderType } from "@/types/files-folders";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Folder() {
  const { files, folders, setFiles, setFolders } = useFilesFolders();
  const [folderInfo, setFolderInfo] = useState<FolderType>();
  const [rootFolderInfo, setRootFolderInfo] = useState<FolderType>();
  const { data: session, status } = useSession();
  const [folderId, setFolderId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const f = async () => {
      const params = new URLSearchParams();
      params.append("folderId", folderId);

      try {
        setLoading(true);
        const response = await fetch(`/api/fs?folderId=${folderId}`, {
          method: "GET",
        });

        const res = await response.json();
        setFolders(res.data.folders);
        setFiles(res.data.files);
        setFolderInfo(res.data.currFolder);

        // only set root folder info for the root directory and never again
        if (!rootFolderInfo) setRootFolderInfo(res.data.currFolder);
      } catch {
        toast.error("Data fetching failed");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && folderId !== "") {
      f();
    }
  }, [folderId, setFolders, setFiles, status, rootFolderInfo]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const rootId = session?.user?.rootFolderId;
    if (status === "authenticated" && rootId !== undefined && rootId !== null) {
      setFolderId(rootId.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status != "authenticated") {
    return <></>;
  }

  return (
    <SidebarProvider>
      <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
        <AppSidebar
          folderInfo={rootFolderInfo}
          folders={folders}
          files={files}
          folderId={folderId}
          setFolderId={setFolderId}
        />
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
            isLoading={loading}
            setFiles={setFiles}
            setFolders={setFolders}
          />
          <div className="fixed max-md:right-5 right-10 max-md:bottom-5 bottom-10">
            <NewItemDropdown
              folderDetails={{
                folderId: folderInfo?.id || -1,
                folderName: folderInfo?.name || "Invalid",
                parentFiles: files,
              }}
              setFilesFolders={{ setFiles, setFolders }}
              dialogOpen={setOpen}
            />
          </div>
        </SidebarInset>
      </Dialog>
    </SidebarProvider>
  );
}
