"use client";

import { deleteFile } from "@/actions/fileHandling";
import { cn } from "@/lib/utils";
import { FileType } from "@/types/files-folders";
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

export default function DisplayFile({
  file,
  setFiles,
}: {
  file: FileType;
  setFiles: Dispatch<SetStateAction<FileType[]>>;
}) {
  const [deleting, setDeleting] = useState(false);

  return (
    <div
      key={file.id}
      className="flex justify-center items-center border rounded-xl relative"
    >
      <div
        className={cn(
          "absolute w-full h-full bg-gray-100 opacity-50 z-100",
          deleting ? "display-[unset]" : "hidden",
        )}
      ></div>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger className="w-full flex justify-center items-center flex-col p-4 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-full max-w-30 aspect-square relative flex items-center justify-center">
              <Image
                alt="File"
                src="/file.png"
                width={512}
                height={512}
                className="w-full h-auto object-contain"
                loading="eager"
              />
            </div>
            <div className="w-full mt-2 flex justify-between items-center align-top">
              <div className="text-center text-xl text-nowrap overflow-hidden text-ellipsis flex-1 inline-block translate-y-[-0.15rem]">
                {file.name}
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
                  const res = await deleteFile(file.id);
                  if (res.success) {
                    toast.success("File deleted");
                    setFiles((files) => files.filter((f) => f.id !== file.id));
                  } else {
                    toast.error("File deletion failed");
                  }
                } catch (e) {
                  toast.error("File deletion failed");
                } finally {
                  setDeleting(false);
                }
              }}
            >
              <Trash />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
          <TooltipContent side={"bottom"}>{file.name}</TooltipContent>
        </DropdownMenu>
      </Tooltip>
    </div>
  );
}
