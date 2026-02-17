"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react"; // or "@/auth" if using Server Actions
import Image from "next/image";

export default function GitHubLogin() {
  return (
    <Button
      variant="outline"
      onClick={() => signIn("github")}
      className="flex items-center gap-2"
    >
      <Image
        src="/github.svg"
        alt="GitHub Logo"
        width={20}
        height={20}
        loading="eager"
      />
      Continue with GitHub
    </Button>
  );
}
