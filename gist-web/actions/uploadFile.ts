"use server";
import { auth } from "@/auth";
import { acceptMaxSize, acceptTypes, maxFiles } from "@/lib/constants";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import dotenv from "dotenv";

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
  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: generateFileName(),
    ContentType: type,
    ContentLength: size,
    Metadata: {
      userId,
    },
  });

  const signedUrl = await getSignedUrl(s3, putObjectCommand, {
    expiresIn: 60,
  });

  return signedUrl;
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

    const signedUrls = await Promise.all(signedUrlsP);
    return { success: true, urls: signedUrls };
  } catch {
    return { success: false, message: "Signed url creation failed" };
  }
}
