"use client";

import { File, Trash } from "lucide-react";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

import { getSignedURLs } from "@/actions/fileHandling";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  acceptMaxSize,
  acceptTypes,
  maxFiles,
  maxMbSize,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { FileType } from "@/types/files-folders";
import { toast } from "sonner";
import {
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Spinner } from "./spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export default function FileUpload({
  folderDetails,
  setFiles,
  dialogOpen,
}: {
  folderDetails: {
    folderName: string;
    folderId: number;
    parentFiles: FileType[];
  };
  setFiles: Dispatch<SetStateAction<FileType[]>>;
  dialogOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [uploadFiles, setUploadFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) =>
      setUploadFiles(() => {
        const res: File[] = [];
        let invalidCount = 0;

        if (acceptedFiles.length > maxFiles) {
          toast.error(`Max ${maxFiles} files allowed`);
          return res;
        }

        for (const file of acceptedFiles) {
          if (
            file.size < acceptMaxSize && // 2 MB
            acceptTypes.includes(file.type)
          ) {
            res.push(file);
          } else {
            invalidCount++;
          }
        }

        if (invalidCount > 0) {
          toast.error(`${invalidCount} files with invalid types or size`);
        }

        return res;
      }),
  });

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (uploadFiles.length === 0) return;

    try {
      setIsUploading(true);

      // Checking if current file name exists in folder already
      const uploadFilesSet = new Set<string>();
      for (const { name } of uploadFiles) {
        uploadFilesSet.add(name);
      }

      for (const { name } of folderDetails.parentFiles) {
        if (uploadFilesSet.has(name)) {
          toast.error(`File ${name} already exists`);
          return;
        }
      }

      const fileTypes = uploadFiles.map((file) => file.type);
      const fileSizes = uploadFiles.map((file) => file.size);
      const signedUrl = await getSignedURLs(fileTypes, fileSizes);
      if (!signedUrl.success || !signedUrl.urls) {
        toast.error(signedUrl.message);
        return;
      }

      const urls = signedUrl.urls;
      const s3UploadsP = [];

      try {
        const filesDetails = [];
        for (let i = 0; i < urls.length; i++) {
          filesDetails.push({
            name: uploadFiles[i].name,
            s3url: signedUrl.urls[i].signedUrl.split("?")[0],
            key: signedUrl.urls[i].key,
          });
        }
        // first upload all the files to the database to avoid race condition
        const response = await (
          await fetch("/api/fs/files", {
            method: "POST",
            body: JSON.stringify({
              filesDetails,
              parentFolder: folderDetails.folderId,
            }),
          })
        ).json();

        for (let i = 0; i < urls.length; i++) {
          s3UploadsP.push(
            fetch(urls[i].signedUrl, {
              method: "PUT",
              body: uploadFiles[i],
              headers: {
                "Content-Type": uploadFiles[i].type,
              },
            }),
          );
        }

        // then insert the data to s3 and trigger the event
        await Promise.all(s3UploadsP);

        if (!response.success) {
          toast.error(response.message);
        } else {
          setFiles((prev) => [...prev, ...response.data]);
          toast.success("File(s) uploaded");
        }

        setUploadFiles([]);
      } catch (e) {
        console.error(e);
        toast.error("File(s) uploading failed");
      }
    } catch (e) {
      toast.error("Uploading failed");
      console.error(e);
    } finally {
      setIsUploading(false);
      dialogOpen(false);
    }
  };

  const [count, setCount] = useState(0);

  const filesList = uploadFiles.map((file) => (
    <li key={file.name} className="relative">
      <Card className="relative p-4">
        <CardContent className="flex w-full items-center space-x-3 p-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <File className="h-5 w-5 text-foreground" aria-hidden={true} />
          </span>

          <div className="flex-1 min-w-0">
            <p className="truncate font-medium text-foreground">
              <Tooltip>
                <TooltipTrigger>
                  {file.name}
                </TooltipTrigger>
                <TooltipContent>{file.name}</TooltipContent>
              </Tooltip>
            </p>
            <p className="text-pretty mt-0.5 text-sm text-muted-foreground">
              {file.size} bytes
            </p>
          </div>

          <div className="shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove file"
              onClick={() =>
                setUploadFiles((prevFiles) =>
                  prevFiles.filter((prevFile) => prevFile.name !== file.name),
                )
              }
            >
              <Trash className="h-5 w-5" aria-hidden={true} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </li>
  ));

  useEffect(() => {
    setCount(uploadFiles.length);
  }, [uploadFiles]);

  return (
    <div className="flex flex-col">
      <DialogHeader>
        <DialogTitle>Upload file</DialogTitle>
        <DialogDescription>
          Upload {count} files to{" "}
          <span className="inline whitespace-nowrap overflow-hidden text-ellipsis">
            {folderDetails?.folderName}
          </span>
        </DialogDescription>
      </DialogHeader>
      <br />
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
          <div className="col-span-full">
            <Label htmlFor="file-upload-2" className="font-medium">
              File(s) upload
            </Label>
            <div
              {...getRootProps()}
              className={cn(
                isDragActive
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : "border-border",
                "mt-2 flex justify-center rounded-md border border-dashed px-6 py-6 transition-colors duration-200",
              )}
            >
              <div>
                <File
                  className="mx-auto h-12 w-12 text-muted-foreground/80"
                  aria-hidden={true}
                />
                <div className="mt-4 flex text-muted-foreground">
                  <p>Drag and drop or</p>
                  <label
                    htmlFor="file"
                    className="relative cursor-pointer rounded-sm pl-1 font-medium text-primary hover:text-primary/80 hover:underline hover:underline-offset-4"
                  >
                    <span>choose file(s)</span>
                    <input
                      {...getInputProps()}
                      id="file-upload-2"
                      name="file-upload-2"
                      type="file"
                      className="sr-only"
                    />
                  </label>
                  <p className="text-pretty pl-1">to upload</p>
                </div>
              </div>
            </div>

            <p className="text-pretty mt-2 text-sm leading-5 text-muted-foreground sm:flex sm:items-center sm:justify-between">
              <span>Only .jpg, .jpeg, .png files allowed</span>
              <span className="pl-1 sm:pl-0">
                Max. size per file: {maxMbSize}MB
              </span>
            </p>

            {filesList.length > 0 && (
              <>
                <h4 className="text-balance mt-6 font-medium text-foreground">
                  File(s) to upload
                </h4>
                <ul role="list" className="mt-4 space-y-4 h-30 overflow-scroll">
                  {filesList}
                </ul>
              </>
            )}
          </div>
        </div>
        <br />
        <div className="flex items-center justify-end space-x-3">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" className="w-20">
            {isUploading ? <Spinner /> : "Upload"}
          </Button>
        </div>
      </form>
    </div>
  );
}
