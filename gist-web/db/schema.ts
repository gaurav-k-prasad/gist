import { defineRelations } from "drizzle-orm";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),

  rootFolderId: varchar("root_folder_id"),
});

export const folders = pgTable("folders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),

  userId: varchar("user_id").notNull(),
  parentFolder: integer("parent_folder"),
});

export const files = pgTable("files", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  s3url: varchar().notNull(),
  path: varchar(),

  folderId: integer("folder_id").notNull(),
  userId: integer("user_id").notNull(),
});

export const relations = defineRelations({ users, folders, files }, (r) => ({
  users: {
    rootFolder: r.one.folders({
      from: r.users.rootFolderId,
      to: r.folders.id,
    }),
  },

  folders: {
    owner: r.one.users({
      from: r.folders.userId,
      to: r.users.id,
    }),

    parent: r.one.folders({
      from: r.folders.parentFolder,
      to: r.folders.id,
    }),

    subfolders: r.many.folders({
      from: r.folders.id,
      to: r.folders.parentFolder,
    }),
  },

  files: {
    owner: r.one.users({
      from: r.files.userId,
      to: r.users.id,
    }),

    parentFolder: r.one.folders({
      from: r.files.folderId,
      to: r.folders.id,
    }),
  },
}));
