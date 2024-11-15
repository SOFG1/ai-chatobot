export type LLM = {
  id: string
  display_name: string
}

export type Message = {
  id?: string
  role: string
  content: string
  llm?: string
  order?: number
  metadata?: any
  error?: boolean
  citations?: Citation[]
  created: string
}

export enum IndexingStatus {
  PENDING = 'pending',
  INDEXED = 'indexed',
  FAILED = 'failed'
}

export type FilesDirectory = {
  canonical: string
  id: string
  name: string
  parent_id: string | null
}

export type FilesDirectoryUser = {
  name: string
  id: string
  parent_id: string | null
  canonical: string
  files: FileUser[]
  parent: FilesDirectory | null
  children: FilesDirectory[]
}

export type FileUser = {
  id: string
  file_name: string
  created: string
  mime_type: string
  expires: string | null
  modified: string
  url: string
  file: File
  directory: FilesDirectory
}

export type File = {
  mime_type: string
  file_size: number
  url: string
  indexing_status: IndexingStatus
  hash: string
  created: string
  path: string
  id: string
}

export type UserScope = 'conversations' | 'chatbots' | 'files' | 'users' | 'group' | '*'

export type User = {
  id: string
  username: string
  name: string
  created: string
  root_directory: FilesDirectory
  scopes: string // UserScope type separated by comma
  avatar: string
}

export type UserCredentials = {
  username: string
  password: string
}

export type UserChangePasswordRequest = {
  old_password: string
  new_password: string
}

export type UserChangeAvatarRequest = {
  avatar: string
}

export type ChatbotIndividual = {
  username: string
  name: string
  avatar?: string
  id: string
}

export type ChatbotGroup = {
  created: string
  description: string
  icon: string
  id: string
  name: string
}

export type Chatbot = {
  id?: string
  name: string
  description: string
  system_prompt: string
  color: string
  owner_id: string
  files: string[] | FileUser[] // id's of files (uuid)
  citations_mode: boolean
  individuals: ChatbotIndividual[]
  groups: ChatbotGroup[]
  icon: string
}

export type CreateChatbot = Omit<Chatbot, 'id' | 'groups' | 'individuals' | 'owner_id'>

export type CreateGroupPayload = {
  name: string
  description: string
  icon?: string
}

export type GroupMember = {
  id: string
  username: string
  name: string
  avatar: string
}

export type Group = {
  name: string
  description: string
  icon: string
  id: string
  member: GroupMember[]
  chatbots: {
    name: string
    description: string
    system_prompt: string
    citations_mode: boolean
    icon: string
    id: string
    owner_id: string
    color: string
  }[]
}

export type Conversation = {
  id?: string
  title: string
  history: Message[]
  chatbot: Chatbot
  ts_created: string
  ts_last_updated: string
}

export type ConversationIdAndTitle = {
  id: string
  title: string | null
  ts_created: string
  ts_last_updated: string
}

export type Citation = {
  file_id: string
  file_user_id: string
  file_name: string
  file_size: number
  file_url: string
  page: number
  source: string
  context_content: string
}
export type ERROR_422_RESPONSE = {
  input: string
  loc: string[]
  msg: string
  type: string
  ctx: any
}
export type CreateUserData = {
  username: string
  name: string
  email: string
  password: string
  avatar?: string
  scopes: string | string[]
}

export enum FileFetchStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  FETCHING = 'fetching',
  IDLE = 'idle'
}
