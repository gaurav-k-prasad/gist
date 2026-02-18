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

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user && user.email) {
        // Available only when signin and signup and not during update
        const dbUser = await db.query.users.findFirst({
          where: { email: user.email },
        });

        if (dbUser) {
          token.dbId = dbUser.id;
          token.rootFolderId = dbUser.rootFolderId;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.dbId = token.dbId as number;
        session.user.rootFolderId = token.rootFolderId as number;
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
                    name: newUser.name,
                    path: newUser.name,
                    userId: newUser.id,
                    parentFolder: null,
                    ancestorsIds: "", // no ancestors
                  })
                  .returning()
              )[0];

              await tx
                .update(users)
                .set({ rootFolderId: newFolder.id })
                .where(eq(users.id, newUser.id));
            });
          }
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
