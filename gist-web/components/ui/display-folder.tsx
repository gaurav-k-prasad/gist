"use client";

import { deleteFolder } from "@/actions/fileHandling";
import { cn } from "@/lib/utils";
import { FolderType } from "@/types/files-folders";
import { EllipsisVertical, Trash } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export default function DisplayFolder({
  folder,
  setFolderId,
  setFolders,
}: {
  folder: FolderType;
  setFolderId: Dispatch<SetStateAction<string>>;
  setFolders: Dispatch<SetStateAction<FolderType[]>>;
}) {
  const [deleting, setDeleting] = useState(false);
  return (
    <div
      key={folder.id}
      className="flex justify-center items-center border rounded-xl relative"
    >
      <div
        className={cn(
          "absolute w-full h-full bg-gray-100 opacity-50 z-100",
          deleting ? "display-[unset]" : "hidden",
        )}
      ></div>
      <div className="w-full">
        <Tooltip>
          <DropdownMenu>
            <TooltipTrigger
              className="w-full flex justify-center items-center flex-col p-4 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => {
                setFolderId(folder.id.toString());
              }}
            >
              <div className="w-full max-w-30 aspect-square relative flex items-center justify-center">
                <Image
                  alt="Folder"
                  src="/folder.png"
                  width={512}
                  height={512}
                  className="w-full h-auto object-contain"
                  loading="eager"
                />
              </div>
              <div className="w-full mt-2 flex justify-between items-center align-top">
                <div className="text-center text-xl text-nowrap overflow-hidden text-ellipsis flex-1 inline-block translate-y-[-0.15rem]">
                  {folder.name}
                </div>
                <DropdownMenuTrigger
                  asChild
                  className="hover:bg-gray-200 p-1 rounded-full"
                >
                  <EllipsisVertical />
                </DropdownMenuTrigger>
              </div>
            </TooltipTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    setDeleting(true);
                    const res = await deleteFolder(
                      folder.id,
                      folder.ancestorsIds,
                    );
                    if (res.success) {
                      toast.success("Folder deleted");
                      setFolders((folders) =>
                        folders.filter((f) => f.id !== folder.id),
                      );
                    } else {
                      toast.error("Folder deletion failed");
                    }
                  } catch (e) {
                    toast.error("Folder deletion failed");
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                <Trash />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
            <TooltipContent side={"bottom"}>{folder.name}</TooltipContent>
          </DropdownMenu>
        </Tooltip>
      </div>
    </div>
  );
}
