import { DefaultJWT } from "@auth/core/jwt";
import { DefaultUser } from "@auth/core/types";

declare module "next-auth" {
  // Extend token to hold the dbId and rootFolderId before it gets put into session
  interface JWT extends DefaultJWT {
    dbId: number;
    rootFolderId: number;
  }

  interface User extends DefaultUser {
    dbId: number;
    rootFolderId: number;
  }
}
