"use client";

import { useFilesFolders } from "@/hooks/useFilesFolders";
import { Folder as FolderType } from "@/types/files-folders";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Folder() {
  const folderId = useParams().folderId?.toString() as string;
  const { files, folders, setFiles, setFolders } = useFilesFolders();
  const [folderInfo, setFolderInfo] = useState<FolderType>();

  useEffect(() => {
    const f = async () => {
      const params = new URLSearchParams();
      params.append("folderId", folderId);

      try {
        const response = await fetch("/api/fs?" + params.toString(), {
          method: "GET",
        });

        const res = await response.json();
        console.log(res);
        setFolders(res.data.folders);
        setFiles(res.data.files);
        setFolderInfo(res.data.currFolder);
      } catch {
        toast.error("Data fetching failed");
      }
    };
    f();
  }, [folderId, setFolders, setFiles]);

  return (
    <>
      <>{JSON.stringify(folderInfo)}</>
      <div>
        {files.map((item) => {
          return (
            <div key={item.name}>
              <div>{item.name}</div>
              <div>{item.path}</div>
              <div>{item.s3url}</div>
            </div>
          );
        })}
      </div>

      <div>
        {folders.map((item) => {
          return (
            <div key={item.name}>
              <div>{item.id}</div>
              <div>{item.name}</div>
              <div>{item.path}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
