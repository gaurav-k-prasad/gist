import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { folders, users } from "./db/schema";
import { db } from "./utils/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === "github") {
        try {
          const existingUser = await db.query.users.findFirst({
            columns: { email: true },
            where: {
              email: user.email as string,
            },
          });

          if (!existingUser) {
            await db.transaction(async (tx) => {
              const newUser = (
                await tx
                  .insert(users)
                  .values({
                    email: user.email!,
                    name: user.name!,
                  })
                  .returning()
              )[0];

              const newFolder = (
                await tx
                  .insert(folders)
                  .values({
                    name: "root",
                    userId: newUser.id,
                    parentFolder: null,
                  })
                  .returning()
              )[0];

              await tx
                .update(users)
                .set({ rootFolderId: newFolder.id })
                .where(eq(users.id, newUser.id));
            });
          }
          console.log("existing", existingUser);
          return true;
        } catch (error) {
          console.error("Error saving user to database", error);
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
