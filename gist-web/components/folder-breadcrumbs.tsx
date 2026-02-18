import { Folder as FolderType } from "@/types/files-folders";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

export default function FolderBreadcrumbs({
  currFolder,
}: {
  currFolder: FolderType | undefined;
}) {
  if (!currFolder) {
    return <></>;
  }

  const folders = currFolder.path.split("/");
  const ancestorsNames = folders.slice(0, -1);
  const currFolderName = folders[folders.length - 1];
  const ancestorsIds =
    currFolder.ancestorsIds.length > 0
      ? currFolder.ancestorsIds.split("/")
      : [];

  console.log(ancestorsIds);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {ancestorsNames.map((ancestor, i) => (
          <React.Fragment key={i}>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={`/home/${ancestorsIds[i]}`}>
                {ancestor}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
          </React.Fragment>
        ))}

        <BreadcrumbItem>
          <BreadcrumbPage>{currFolderName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
