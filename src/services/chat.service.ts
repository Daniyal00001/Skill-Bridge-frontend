import { api } from '@/lib/api'

export interface ChatRoom {
  id: string
  contractId: string | null
  projectId: string | null
  clientProfileId: string | null
  freelancerProfileId: string | null
  createdAt: string
  lastMessage?: ChatMessage | null
  unreadCount: number
  otherUser?: {
    id: string
    name: string
    avatar: string | null
    role: string
    isOnline?: boolean
    lastActiveAt?: string | null
  }
  isMuted?: boolean
  isRestricted?: boolean
  isActiveAI?: boolean
}

export interface ChatMessage {
  id: string
  chatRoomId: string
  senderId: string
  content: string
  type: 'TEXT' | 'FILE' | 'SYSTEM'
  fileUrl: string | null
  fileName?: string | null
  fileSize?: number | null
  fileMimeType?: string | null
  isRead: boolean
  isAiMessage?: boolean
  sentAt: string
  sender: {
    id: string
    name: string
    profileImage: string | null
    role: string | null
  }
}

export interface PaginatedMessages {
  messages: ChatMessage[]
  nextCursor: string | null
  hasMore: boolean
}

// ── API Calls ─────────────────────────────────────────────────────────────────

export const chatService = {
  getRooms: async (): Promise<ChatRoom[]> => {
    const res = await api.get('/chat/rooms')
    return res.data.data
  },

  openRoom: async (params: {
    clientProfileId: string
    freelancerProfileId: string
    contractId?: string
    projectId?: string
  }): Promise<ChatRoom> => {
    const res = await api.post('/chat/rooms', params)
    return res.data.data
  },

  getMessages: async (roomId: string, cursor?: string): Promise<PaginatedMessages> => {
    const res = await api.get(`/chat/rooms/${roomId}/messages`, {
      params: cursor ? { cursor } : {},
    })
    return res.data.data
  },

  sendMessage: async (roomId: string, content: string): Promise<ChatMessage> => {
    const res = await api.post(`/chat/rooms/${roomId}/messages`, { content, type: 'TEXT' })
    return res.data.data
  },

  uploadAttachments: async (roomId: string, files: File[]): Promise<ChatMessage[]> => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    const res = await api.post(`/chat/rooms/${roomId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  markSeen: async (roomId: string): Promise<void> => {
    await api.post(`/chat/rooms/${roomId}/seen`)
  },

  muteRoom: async (roomId: string, muted: boolean): Promise<void> => {
    await api.patch(`/chat/rooms/${roomId}/mute`, { muted })
  },

  restrictUser: async (roomId: string, targetUserId: string, restricted: boolean): Promise<void> => {
    await api.patch(`/chat/rooms/${roomId}/restrict`, { targetUserId, restricted })
  },

  deleteRoom: async (roomId: string): Promise<void> => {
    await api.delete(`/chat/rooms/${roomId}`)
  },
}
