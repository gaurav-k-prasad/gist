export interface FileType {
  id: number;
  name: string;
  s3url: string;
  s3key: string;
  path: string;
  folderId: number;
  userId: number;
}

export interface FolderType {
  id: number;
  name: string;
  path: string;
  userId: number;
  parentFolder: number?;
  ancestorsIds: string;
}
