import { useFilesFolders } from "@/hooks/useFilesFolders";
import { FileType, FolderType } from "@/types/files-folders";
import { ChevronRight, File, Folder } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
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

export default function SidebarFolder({
  folderInfo,
  currFolders,
  currFiles,
  folderId,
  setFolderId,
}: {
  folderInfo?: FolderType;
  currFolders: FolderType[];
  currFiles: FileType[];
  folderId: string;
  setFolderId: Dispatch<SetStateAction<string>>;
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
      folderInfo.id.toString() === folderId &&
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
          <div className="flex items-center">
            <SidebarMenuButton tooltip={folderInfo?.name} className="py-1 grow">
              <Folder />
              <span
                className={`w-full overflow-hidden text-ellipsis  ${folderId !== folderInfo.id.toString() ? "cursor-pointer" : ""}`}
                onClick={() => {
                  setFolderId(folderInfo.id.toString());
                }}
              >
                {folderInfo.name}
              </span>
            </SidebarMenuButton>

            <CollapsibleTrigger asChild className="overflow-hidden">
              <ChevronRight
                className={`ml-auto transition-transform duration-200 ${isOpen && "rotate-90!"} hover:bg-gray-200 rounded-full p-1`}
              />
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <SidebarMenuSub className="mr-0 pr-0">
              {folders.map((subItem) => {
                return (
                  <SidebarFolder
                    key={subItem.id + "-folder"}
                    folderInfo={subItem}
                    currFiles={currFiles}
                    currFolders={currFolders}
                    folderId={folderId}
                    setFolderId={setFolderId}
                  />
                );
              })}

              {files.map((subItem) => (
                <SidebarMenuSubItem key={subItem.id + "-file"}>
                  <SidebarMenuSubButton>
                    <File />
                    <span className="w-full overflow-hidden text-ellipsis pr-3">
                      {subItem.name}
                    </span>
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
