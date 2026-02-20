import { FileType } from "@/types/files-folders";
import { Dispatch, SetStateAction } from "react";
import DisplayFile from "./display-file";

export default function Files({
  files,
  setFiles,
}: {
  files: FileType[];
  setFiles: Dispatch<SetStateAction<FileType[]>>;
}) {
  return (
    <>
      {files.map((file) => (
        <DisplayFile file={file} key={file.id} setFiles={setFiles} />
      ))}
    </>
  );
}
