import { auth } from "@/auth";

export default async function Home() {
  const user = await auth();
  return <>{JSON.stringify(user?.user)}</>;
}
