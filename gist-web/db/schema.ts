import { FileType } from "@/types/files-folders";
import { defineRelations } from "drizzle-orm";
import { integer, pgTable, varchar, vector } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),

  rootFolderId: integer("root_folder_id"),
});

export const publicUserType = {
  id: users.id,
  name: users.name,
  email: users.email,
  rootFolderId: users.rootFolderId,
};

export const folders = pgTable("folders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  path: varchar().notNull(),

  userId: integer("user_id").notNull(),
  parentFolder: integer("parent_folder"),

  // Stores ids of ancestors in form of string "32/44/234/23"
  ancestorsIds: varchar("ancestors_ids").notNull(),
});

export const publicFolderType = {
  id: folders.id,
  name: folders.name,
  path: folders.path,
  userId: folders.userId,
  parentFolder: folders.parentFolder,
  ancestorsIds: folders.ancestorsIds,
};

export const files = pgTable("files", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  s3url: varchar().notNull(),
  s3key: varchar().notNull().unique(),
  path: varchar().notNull(),

  folderId: integer("folder_id").notNull(),
  userId: integer("user_id").notNull(),
  embedding: vector("embedding", { dimensions: 512 }),
});

export const publicFileType = {
  id: files.id,
  name: files.name,
  s3url: files.s3url,
  s3key: files.s3key,
  path: files.path,
  folderId: files.folderId,
  userId: files.userId,
};

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
