import { useFilesFolders } from "@/hooks/useFilesFolders";
import { File as FileType, Folder as FolderType } from "@/types/files-folders";
import { ChevronRight, File, Folder } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "./sidebar";
import Link from "next/link";

export default function SidebarFolder({
  folderInfo,
  currFolders,
  currFiles,
  currFolderId,
}: {
  folderInfo?: FolderType;
  currFolders: FolderType[];
  currFiles: FileType[];
  currFolderId: string;
}) {
  const { files, folders, setFiles, setFolders } = useFilesFolders();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const f = async () => {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append("folderId", folderInfo?.id.toString() as string);

      try {
        const response = await fetch(`/api/fs?` + params.toString(), {
          method: "GET",
        });

        const res = await response.json();
        setFolders(res.data.folders);
        setFiles(res.data.files);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      f();
    }
  }, [isOpen, setFolders, setFiles, folderInfo]);

  useEffect(() => {
    if (
      (currFolders.length !== folders.length ||
        currFiles.length !== files.length) &&
      folderInfo &&
      folderInfo.id.toString() === currFolderId &&
      !isLoading
    ) {
      setFolders(currFolders);
      setFiles(currFiles);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currFiles,
    currFolders,
    folderInfo,
    setFolders,
    setFiles,
    files.length,
    folders.length,
    isLoading,
  ]);

  if (!folderInfo) {
    return <>Loading...</>;
  }

  return (
    <SidebarMenu>
      <Collapsible
        asChild
        className="group/collapsible"
        onOpenChange={(open) => {
          setIsOpen(open);
        }}
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild className="w-full overflow-hidden">
            <SidebarMenuButton tooltip={folderInfo?.name}>
              <Folder />
              <span className="w-full overflow-hidden text-ellipsis">
                {folderInfo.name}
              </span>
              <ChevronRight
                className={`ml-auto transition-transform duration-200 ${isOpen && "rotate-90!"}`}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className="mr-0 pr-0">
              {folders.map((subItem) => {
                return (
                  <SidebarFolder
                    key={subItem.id + "-folder"}
                    folderInfo={subItem}
                    currFiles={currFiles}
                    currFolders={currFolders}
                    currFolderId={currFolderId}
                  />
                );
              })}

              {files.map((subItem) => (
                <SidebarMenuSubItem key={subItem.id + "-file"}>
                  <SidebarMenuSubButton asChild>
                    <div>
                      <File />
                      <Link href={subItem.s3url}>
                        <span>{subItem.name}</span>
                      </Link>
                    </div>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  );
}
