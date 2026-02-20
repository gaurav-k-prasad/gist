import { FolderType } from "@/types/files-folders";
import { Dispatch, SetStateAction } from "react";
import DisplayFolder from "./display-folder";

export default function Folders({
  folders,
  setFolderId,
  setFolders,
}: {
  folders: FolderType[];
  setFolderId: Dispatch<SetStateAction<string>>;
  setFolders: Dispatch<SetStateAction<FolderType[]>>;
}) {
  return (
    <>
      {folders.map((folder) => (
        <DisplayFolder
          folder={folder}
          setFolderId={setFolderId}
          key={folder.id}
          setFolders={setFolders}
        />
      ))}
    </>
  );
}
