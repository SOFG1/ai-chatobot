import type { FileUser } from '@/types'
import type { FilesTree } from '@/types/internal'

export const FILES_KEY = '_/files' //There can't be a folder with this name, because folder's name can not contain '/'

function addFiles(dir: string[], index: number, tree: FilesTree, file: FileUser) {
  const currentDir = dir[index]
  if (currentDir) {
    if (!tree[currentDir]) tree[currentDir] = {}
    addFiles(dir, index + 1, tree[currentDir] as FilesTree, file)
  }
  if (!currentDir) {
    if (tree[FILES_KEY]) (tree[FILES_KEY] as FileUser[]).push(file)
    if (!tree[FILES_KEY]) tree[FILES_KEY] = [file]
  }
}

export const getFilesFoldersTree = (list: FileUser[]) => {
  const tree: any = {}
  list.forEach((f) => {
    const directory = f.directory.canonical.split('/').filter((d) => d)
    addFiles(directory, 0, tree, f)
  })
  return tree
}
