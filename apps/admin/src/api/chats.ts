import type { ChatUser, Convo } from '@/features/chats/data/chat-types'
import { apiClient } from './client'
import type { ApiConversation } from './types'

function mapMessage(message: ApiConversation['messages'][number]): Convo {
  return {
    sender: message.sender === 'Me' ? 'You' : message.sender,
    message: message.message,
    timestamp: new Date(message.timestamp),
  }
}

export function mapConversation(raw: ApiConversation): ChatUser {
  const messages = raw.messages.map(mapMessage).reverse()
  return {
    id: raw.id,
    fullName: raw.fullName,
    username: raw.username,
    title: raw.title,
    profile: raw.avatar ?? undefined,
    messages,
  }
}

export async function listConversations(): Promise<ChatUser[]> {
  const { data } = await apiClient.get<ApiConversation[]>(
    '/chats/conversations'
  )
  return data.map(mapConversation)
}

export async function getConversation(id: string): Promise<ChatUser> {
  const { data } = await apiClient.get<ApiConversation>(
    `/chats/conversations/${id}`
  )
  return mapConversation(data)
}

export async function createConversation(body: {
  fullName: string
  username: string
  title?: string
  message: string
}): Promise<ChatUser> {
  const { data } = await apiClient.post<ApiConversation>(
    '/chats/conversations',
    body
  )
  return mapConversation(data)
}

export async function sendMessage(
  conversationId: string,
  message: string
): Promise<Convo> {
  const { data } = await apiClient.post<{
    sender: string
    message: string
    timestamp: string
  }>(`/chats/conversations/${conversationId}/messages`, { message })
  return mapMessage(data)
}
