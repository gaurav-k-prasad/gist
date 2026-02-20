import { deleteFile, deleteFolder } from "@/actions/fileHandling";
import { FileType, FolderType } from "@/types/files-folders";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import Files from "./ui/files";
import Folders from "./ui/folders";
import { Spinner } from "./ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function FolderDisplay({
  files,
  folders,
  setFolderId,
  setFiles,
  setFolders,
  isLoading,
}: {
  files: FileType[];
  folders: FolderType[];
  setFolderId: Dispatch<SetStateAction<string>>;
  setFiles: Dispatch<SetStateAction<FileType[]>>;
  setFolders: Dispatch<SetStateAction<FolderType[]>>;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="w-full text-center mt-5">
        <Spinner className="mx-auto" />
      </div>
    );
  }

  if (files.length == 0 && folders.length == 0) {
    return <div className="w-full text-center mt-5">Empty folder</div>;
  }

  return (
    <div className="grid p-5 gap-5 grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
      <Folders folders={folders} setFolderId={setFolderId} setFolders={setFolders} />
      <Files files={files} setFiles={setFiles} />
    </div>
  );
}
