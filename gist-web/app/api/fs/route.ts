import { auth } from "@/auth";
import { files, folders } from "@/db/schema";
import { db } from "@/utils/db";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Gets files and folders belonging to the parent folder folderId
export async function GET(req: NextRequest) {
  const { nextUrl } = req;
  const folderIdStr = nextUrl.searchParams.get("folderId");
  if (!folderIdStr) {
    return NextResponse.json(
      { success: false, message: "FolderId missing" },
      { status: 400 },
    );
  }

  const folderId = parseInt(folderIdStr);
  if (!folderId) {
    return NextResponse.json(
      { success: false, message: "Invalid folderId" },
      { status: 400 },
    );
  }

  const user = await auth();
  if (!user || !user.user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401 },
    );
  }

  try {
    // Check if the folder id even exists for the given user
    const currentFolder = await db
      .select()
      .from(folders)
      .where(and(eq(folders.userId, user.user.dbId), eq(folders.id, folderId)));

    if (currentFolder.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Folder not found",
        },
        { status: 404 },
      );
    }

    const foldersData = db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.userId, user.user.dbId),
          eq(folders.parentFolder, folderId),
        ),
      );

    const filesData = db
      .select()
      .from(files)
      .where(
        and(eq(files.userId, user.user.dbId), eq(files.folderId, folderId)),
      );

    const [folder, file] = await Promise.all([foldersData, filesData]);

    return NextResponse.json(
      {
        success: true,
        data: { folders: folder, files: file, currFolder: currentFolder[0] },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Error fetching data" },
      { status: 500 },
    );
  }
}
