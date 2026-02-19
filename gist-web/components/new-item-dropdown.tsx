"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { File as FileType, Folder as FolderType } from "@/types/files-folders";
import { File, Folder, Plus } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import CreateFolder from "./ui/create-folder";
import { DialogContent, DialogTrigger } from "./ui/dialog";
import FileUpload from "./ui/file-upload";

export default function NewItemDropdown({
  folderDetails,
  setFilesFolders,
  dialogOpen,
}: {
  folderDetails: {
    folderName: string;
    folderId: number;
    parentFiles: FileType[];
  };
  setFilesFolders: {
    setFiles: Dispatch<SetStateAction<FileType[]>>;
    setFolders: Dispatch<SetStateAction<FolderType[]>>;
  };
  dialogOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [create, setCreate] = useState(
    <CreateFolder
      folderDetails={folderDetails}
      setFolder={setFilesFolders.setFolders}
    />,
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="hover:bg-green-300 rounded-2xl p-1 duration-300 border-2 border-green-600 bg-green-200">
            <Plus color="#007400" width={45} height={45} />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="m-4">
          <DialogTrigger
            className="w-full"
            onClick={() =>
              setCreate(
                <CreateFolder
                  folderDetails={folderDetails}
                  setFolder={setFilesFolders.setFolders}
                />,
              )
            }
          >
            <DropdownMenuItem>
              <Folder />
              Create New Folder
            </DropdownMenuItem>
          </DialogTrigger>

          <DropdownMenuSeparator />

          <DialogTrigger
            className="w-full"
            onClick={() =>
              setCreate(
                <FileUpload
                  folderDetails={folderDetails}
                  setFiles={setFilesFolders.setFiles}
                  dialogOpen={dialogOpen}
                />,
              )
            }
          >
            <DropdownMenuItem>
              <File />
              Upload New File
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>{create}</DialogContent>
    </>
  );
}
