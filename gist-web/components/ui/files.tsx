import { FileType } from "@/types/files-folders";
import Link from "next/link";
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
        <Link key={file.id} href={file.s3url} target="_blank">
          <DisplayFile file={file} setFiles={setFiles} />
        </Link>
      ))}
    </>
  );
}
