import { FolderType } from "@/types/files-folders";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { Button } from "./button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Field, FieldGroup } from "./field";
import { Input } from "./input";
import { Label } from "./label";

export default function CreateFolder({
  folderDetails,
  setFolder,
}: {
  folderDetails: {
    folderName: string;
    folderId: number;
  };
  setFolder: Dispatch<SetStateAction<FolderType[]>>;
}) {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        try {
          const response = await (
            await fetch("/api/fs/folders", {
              method: "POST",
              body: JSON.stringify({
                folderName: formData.get("folderName"),
                parentFolder: folderDetails.folderId,
              }),
            })
          ).json();

          if (!response.success) {
            toast.error(response.message);
          } else {
            setFolder((prev) => [...prev, response.newFolder]);
            toast.success("Folder created successfully");
          }
        } catch (e) {
          toast.error("Some error occurred");
          console.error(e);
        }
      }}
    >
      <DialogHeader>
        <DialogTitle>Create a folder?</DialogTitle>
        <DialogDescription>
          Create a new folder in {folderDetails.folderName}
        </DialogDescription>
      </DialogHeader>

      <br />

      <FieldGroup>
        <Field>
          <Label htmlFor="foldername">Folder Name</Label>
          <Input id="foldername" name="folderName" defaultValue="New Folder" />
        </Field>
      </FieldGroup>

      <br />

      <DialogFooter className="sm:justify-end">
        <DialogClose asChild>
          <Button type="button" variant={"destructive"}>
            Close
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="submit" variant={"default"}>
            Create
          </Button>
        </DialogClose>
      </DialogFooter>
    </form>
  );
}
