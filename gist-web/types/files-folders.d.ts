export interface File {
  id: number;
  name: string;
  s3url: string;
  path: string;
  folderId: number;
  userId: number;
}

export interface Folder {
  id: number;
  name: string;
  path: string;
  userId: number;
  parentFolder: number?;
  ancestorsIds: string;
}
