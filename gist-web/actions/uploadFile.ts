import { auth } from "@/auth";

export async function getSignedURL() {
  const session = await auth();

  if (!session) {
    return { success: false, message: "Unauthenticated" };
  }
  return { success: true, url: "" };
}
