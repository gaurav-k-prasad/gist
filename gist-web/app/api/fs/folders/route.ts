import { auth } from "@/auth";
import { folders } from "@/db/schema";
import { db } from "@/utils/db";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Create folder of name
export async function POST(req: NextRequest) {
  const data = await req.json();

  const { folderName, parentFolder } = data;

  if (!folderName || !parentFolder) {
    return NextResponse.json(
      { success: false, message: "Folder name or Parent Folder missing" },
      { status: 400 },
    );
  }

  const parentFolderId = parseInt(parentFolder);
  if (!parentFolderId) {
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
    // Find if there exists the parent folder
    const parentFolder = db
      .select()
      .from(folders)
      .where(
        and(eq(folders.userId, user.user.dbId), eq(folders.id, parentFolderId)),
      );

    // Find if there already exists a folder with same name
    const folder = db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.userId, user.user.dbId),
          eq(folders.name, folderName),
          eq(folders.parentFolder, parentFolderId),
        ),
      );

    const [parentFolderData, folderExists] = await Promise.all([
      parentFolder,
      folder,
    ]);

    if (parentFolderData.length == 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Parent folder does not exists",
        },
        {
          status: 400,
        },
      );
    }

    if (folderExists.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Folder already exists",
        },
        {
          status: 400,
        },
      );
    }

    await db.insert(folders).values({
      name: folderName,
      path: parentFolderData[0].path + "/" + folderName,
      userId: user.user.dbId,
      parentFolder: parentFolderId,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Error creating folder" },
      { status: 500 },
    );
  }
}
