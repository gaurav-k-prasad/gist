import { auth } from "@/auth";
import { files, folders, publicFileType } from "@/db/schema";
import { db } from "@/utils/db";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Create files
export async function POST(req: NextRequest) {
  const data = await req.json();

  const { filesDetails, parentFolder } = data;

  if (!filesDetails || !parentFolder) {
    return NextResponse.json(
      { success: false, message: "Folder names or Parent Folder missing" },
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
    const parentFolderP = db
      .select({ id: folders.id, ancestorsIds: folders.ancestorsIds })
      .from(folders)
      .where(
        and(eq(folders.userId, user.user.dbId), eq(folders.id, parentFolderId)),
      );

    // Fetch all the files in current folder to see if there is any other file with same name
    const parentFilesP = db
      .select({ name: files.name })
      .from(files)
      .where(
        and(
          eq(files.userId, user.user.dbId),
          eq(files.folderId, parentFolderId),
        ),
      );

    const [parentFolder, parentFiles] = await Promise.all([
      parentFolderP,
      parentFilesP,
    ]);

    if (parentFolder.length === 0) {
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

    // Checking if current file name exists in folder already
    const uploadFilesSet = new Set<string>();
    for (const { name } of filesDetails) {
      uploadFilesSet.add(name);
    }

    for (const { name } of parentFiles) {
      if (uploadFilesSet.has(name)) {
        return NextResponse.json({
          success: false,
          message: "File already exists with same name",
        });
      }
    }

    type FileInsertType = typeof files.$inferInsert;
    const insertValues: FileInsertType[] = [];

    let path;
    if (parentFolder[0].ancestorsIds !== "") {
      path = parentFolder[0].ancestorsIds + "/" + parentFolderId.toString();
    } else {
      path = parentFolderId.toString();
    }

    for (const fileDetail of filesDetails) {
      insertValues.push({
        folderId: parentFolderId,
        name: fileDetail.name,
        path: path,
        s3url: fileDetail.s3url,
        s3key: fileDetail.key,
        userId: user.user.dbId,
      });
    }

    const data = await db
      .insert(files)
      .values(insertValues)
      .returning(publicFileType);

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Error uploading files" },
      { status: 500 },
    );
  }
}
