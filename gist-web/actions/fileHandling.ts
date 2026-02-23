"use server";
import { auth } from "@/auth";
import { files, folders } from "@/db/schema";
import { acceptMaxSize, acceptTypes, maxFiles } from "@/lib/constants";
import { db } from "@/utils/db";
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import dotenv from "dotenv";
import { and, eq, like } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

export async function getSignedURL(type: string, size: number, userId: string) {
  const key = generateFileName();
  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    ContentType: type,
    ContentLength: size,
    Metadata: {
      userId,
    },
  });

  const signedUrl = await getSignedUrl(s3, putObjectCommand, {
    expiresIn: 60,
  });

  return { signedUrl, key };
}

export async function getSignedURLs(types: string[], sizes: number[]) {
  const session = await auth();

  if (!session) {
    return { success: false, message: "Unauthenticated" };
  }
  const n = types.length;

  if (n > maxFiles) {
    return { success: false, message: `Max files: ${maxFiles}` };
  }

  for (let i = 0; i < n; i++) {
    if (!acceptTypes.includes(types[i]) || sizes[i] > acceptMaxSize) {
      return { success: false, message: "Invalid type" };
    }
  }

  try {
    const signedUrlsP = [];
    for (let i = 0; i < n; i++) {
      signedUrlsP.push(
        getSignedURL(
          types[i],
          sizes[i],
          session.user?.dbId.toString() as string,
        ),
      );
    }

    const signedUrlsKeys = await Promise.all(signedUrlsP);
    return { success: true, urls: signedUrlsKeys };
  } catch {
    return { success: false, message: "Signed url creation failed" };
  }
}

export async function deleteFolder(folderId: number, ancestorPathIds: string) {
  const user = await auth();
  if (user?.user?.dbId === undefined) {
    return { success: false, message: "Unauthenticated" };
  }

  try {
    const doesMainFolderExist = await db
      .select({id: folders.id})
      .from(folders)
      .where(and(eq(folders.userId, user.user.dbId), eq(folders.id, folderId)));

    if (doesMainFolderExist.length === 0) {
      return { success: false, message: "No such folder found" };
    }

    const deleteFiles = await db.transaction(async (tx) => {
      const deleteSubFoldersP = tx
        .delete(folders)
        .where(
          like(folders.ancestorsIds, `${ancestorPathIds + "/" + folderId}%`),
        );

      const deleteFilesP = tx
        .delete(files)
        .where(like(files.path, `${ancestorPathIds + "/" + folderId}%`))
        .returning({ s3url: files.s3url });

      const [deleteFiles] = await Promise.all([
        deleteFilesP,
        deleteSubFoldersP,
      ]);

      // Delete main folder last to avoid constraint error
      await tx.delete(folders).where(eq(folders.id, folderId));

      return deleteFiles;
    });

    if (deleteFiles.length > 0) {
      const keys = deleteFiles.map((file) => ({
        Key: file.s3url.split("/").slice(-1)[0],
      }));

      const deleteObjectsCommand = new DeleteObjectsCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Delete: {
          Objects: keys,
        },
      });

      await s3.send(deleteObjectsCommand);
    }
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Error deleting folder" };
  }
}

export async function deleteFile(fileId: number) {
  const user = await auth();
  if (user?.user?.dbId === undefined) {
    return { success: false, message: "Unauthenticated" };
  }

  try {
    const res = await db
      .delete(files)
      .where(and(eq(files.id, fileId), eq(files.userId, user.user.dbId)))
      .returning({s3url: files.s3url});

    // if no deleted file that means user doesn't have that file
    if (res.length === 0) {
      return { success: false, message: "No such file found" };
    }

    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: res[0].s3url.split("/").slice(-1)[0],
    });

    await s3.send(deleteObjectCommand);

    return { success: true };
  } catch (e) {
    return { success: false, message: "Deletion failed" };
  }
}
