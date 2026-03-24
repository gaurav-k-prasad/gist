"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileType } from "@/types/files-folders";
import debounce from "lodash.debounce";
import { File, Search } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export default function SearchDialog({ files }: { files: FileType[] }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [searchResult, setSearchResult] = React.useState<FileType[]>([]);

  const getSimilar = React.useMemo(
    () =>
      debounce(async (keyword: string) => {
        console.log(`fetching data for query "${keyword}"`);
        const response = await fetch("/api/search", {
          body: JSON.stringify({
            query: keyword,
          }),
          method: "POST",
        });
        const data = await response.json();
        console.log(data);
        setSearchResult(data.data);
      }, 500),
    [],
  );

  React.useEffect(() => {
    if (search !== "") {
      getSimilar(search);
    } else {
      setSearchResult(files);
    }
  }, [search, files]);

  return (
    <div className="flex flex-col items-center justify-center">
      <Button onClick={() => setOpen(true)} variant="outline" className="w-fit">
        <Search />
      </Button>
      <div className="flex">
        <CommandDialog
          open={open}
          onOpenChange={(open) => {
            setOpen(open);
            setSearch(""); // clear the search
          }}
        >
          <Command shouldFilter={false}>
            <form onSubmit={() => {}}>
              <CommandInput
                placeholder="Search..."
                onValueChange={(v) => {
                  setSearch(v);
                }}
              />
            </form>
            <CommandList className="h-100">
              <CommandEmpty>No results found.</CommandEmpty>

              {searchResult.length > 0 && (
                <CommandGroup heading="Files">
                  {searchResult.map((file) => {
                    return (
                      <Link href={file.s3url} key={file.id} target="_blank">
                        <CommandItem>
                          <File />
                          <span>{file.name}</span>
                        </CommandItem>
                      </Link>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </CommandDialog>
      </div>
    </div>
  );
}
