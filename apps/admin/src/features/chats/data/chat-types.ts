export type Convo = {
  sender: string
  message: string
  timestamp: Date
}

export type ChatUser = {
  id: string
  profile?: string
  username: string
  fullName: string
  title: string
  messages: Convo[]
}

export type ChatContact = Omit<ChatUser, 'messages'>
