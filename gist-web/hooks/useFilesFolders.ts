import { FileType, FolderType } from "@/types/files-folders";
import { useState } from "react";

export function useFilesFolders() {
  const [files, setFiles] = useState<FileType[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);

  return { files, folders, setFiles, setFolders };
}
