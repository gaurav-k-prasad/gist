import { File as FileType, Folder as FolderType } from "@/types/files-folders";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function FolderDisplay({
  files,
  folders,
  setFolderId,
}: {
  files: FileType[];
  folders: FolderType[];
  setFolderId: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="grid p-5 gap-5 grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
      {/* FOLDERS */}
      {folders.map((folder) => (
        <div key={folder.id} className="flex justify-center items-center">
          <div
            onClick={() => setFolderId(folder.id.toString())}
            className="w-full"
          >
            <Tooltip>
              <TooltipTrigger className="w-full flex justify-center items-center flex-col p-4 hover:bg-gray-100 rounded-lg transition-colors">
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
                <div className="text-center text-xl text-nowrap overflow-hidden text-ellipsis w-full mt-2">
                  {folder.name}
                </div>
              </TooltipTrigger>
              <TooltipContent side={"bottom"}>{folder.name}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      ))}

      {/* FILES */}
      {files.map((file) => (
        <div key={file.id} className="flex justify-center items-center">
          <Tooltip>
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
              <div className="text-center text-xl text-nowrap overflow-hidden text-ellipsis w-full mt-2">
                {file.name}
              </div>
            </TooltipTrigger>
            <TooltipContent side={"bottom"}>{file.name}</TooltipContent>
          </Tooltip>
        </div>
      ))}
    </div>
  );
}
