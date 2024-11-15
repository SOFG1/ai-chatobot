import type { FileUser, IndexingStatus } from '.'

export interface Folder {
  id: number
  name: string
  children: Folder[]
  fileCount: number
  parent?: Folder
}

export interface File {
  id: string
  name: string
  folderId: number
}

export interface TsaiContextMenuOption {
  name: string
  class?: string
  type: string
  icon?: string
  action?: () => void
}

export interface DropdownOption {
  label: string
  value: any // Changed to 'any' to accommodate enum values
}

export type SortingType = {
  dir: 'asc' | 'desc'
  property: 'a-z' | 'last-change' | undefined
}

export type FilesFiltersType = IndexingStatus[]

export type FilesFolderType = {
  [key: string]: FilesFolderType | FileUser[]
}

export type FileToUpload = { file: any; name: string; size: number; uploaded: boolean }

export type FilesTree = {
  [key: string]: FilesTree | FileUser[]
}
