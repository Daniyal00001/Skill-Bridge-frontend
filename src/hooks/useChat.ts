import { useEffect, useRef, useState, useCallback } from 'react'
import { getSocket } from '@/lib/socket'
import { chatService, ChatRoom, ChatMessage } from '@/services/chat.service'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface TypingUser {
  userId: string
  userName: string
  roomId: string
}

export function useChat(activeRoomId?: string) {
  const { user } = useAuth()
  const socketRef = useRef(getSocket())

  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  // ── Load Rooms ─────────────────────────────────────────────────────────────
  const loadRooms = useCallback(async () => {
    try {
      setIsLoadingRooms(true)
      const data = await chatService.getRooms()
      setRooms(data)
    } catch {
      toast.error('Failed to load conversations')
    } finally {
      setIsLoadingRooms(false)
    }
  }, [])

  // ── Load Messages ──────────────────────────────────────────────────────────
  const loadMessages = useCallback(async (roomId: string, cursor?: string) => {
    try {
      setIsLoadingMessages(true)
      const data = await chatService.getMessages(roomId, cursor)
      if (cursor) {
        setMessages((prev) => [...data.messages, ...prev])
      } else {
        setMessages(data.messages)
      }
      setHasMore(data.hasMore)
      setNextCursor(data.nextCursor)
    } catch {
      toast.error('Failed to load messages')
    } finally {
      setIsLoadingMessages(false)
    }
  }, [])

  // ── Load More (older messages) ─────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (activeRoomId && nextCursor && !isLoadingMessages) {
      loadMessages(activeRoomId, nextCursor)
    }
  }, [activeRoomId, nextCursor, isLoadingMessages, loadMessages])

  // ── Send Text Message ──────────────────────────────────────────────────────
  const sendMessage = useCallback(
    (content: string) => {
      if (!activeRoomId || !content.trim()) return
      const socket = socketRef.current
      socket.emit('send_message', { roomId: activeRoomId, content })
      stopTyping()
    },
    [activeRoomId]
  )

  // ── Send Attachment ────────────────────────────────────────────────────────
  const sendAttachment = useCallback(
    async (files: File[]) => {
      if (!activeRoomId) return
      try {
        setIsUploading(true)
        const newMessages = await chatService.uploadAttachments(activeRoomId, files)
        setMessages((prev) => [...prev, ...newMessages])
        // Reload rooms to update last message
        await loadRooms()
      } catch {
        toast.error('Failed to upload file(s)')
      } finally {
        setIsUploading(false)
      }
    },
    [activeRoomId, loadRooms]
  )

  // ── Typing Indicators ──────────────────────────────────────────────────────
  const startTyping = useCallback(() => {
    if (!activeRoomId || !user) return
    const socket = socketRef.current
    if (!isTypingRef.current) {
      isTypingRef.current = true
      socket.emit('typing_start', { roomId: activeRoomId, userName: user.name })
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => stopTyping(), 3000)
  }, [activeRoomId, user])

  const stopTyping = useCallback(() => {
    if (!activeRoomId) return
    const socket = socketRef.current
    if (isTypingRef.current) {
      isTypingRef.current = false
      socket.emit('typing_stop', { roomId: activeRoomId })
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
  }, [activeRoomId])

  // ── Delete Room ───────────────────────────────────────────────────────────
  const deleteRoom = useCallback(async (roomId: string) => {
    try {
      await chatService.deleteRoom(roomId)
      setRooms((prev) => prev.filter((r) => r.id !== roomId))
      toast.success('Chat deleted')
    } catch {
      toast.error('Failed to delete chat')
    }
  }, [])

  // ── Mark Seen ─────────────────────────────────────────────────────────────
  const markSeen = useCallback(async () => {
    if (!activeRoomId) return
    try {
      await chatService.markSeen(activeRoomId)
      const socket = socketRef.current
      socket.emit('mark_seen', { roomId: activeRoomId })
      // Update local unread count
      setRooms((prev) =>
        prev.map((r) => (r.id === activeRoomId ? { ...r, unreadCount: 0 } : r))
      )
    } catch {}
  }, [activeRoomId])

  // ── Mute Room ─────────────────────────────────────────────────────────────
  const muteRoom = useCallback(
    async (muted: boolean) => {
      if (!activeRoomId) return
      await chatService.muteRoom(activeRoomId, muted)
      setRooms((prev) =>
        prev.map((r) => (r.id === activeRoomId ? { ...r, isMuted: muted } : r))
      )
      toast.success(muted ? 'Conversation muted' : 'Conversation unmuted')
    },
    [activeRoomId]
  )

  // ── Restrict User ─────────────────────────────────────────────────────────
  const restrictUser = useCallback(
    async (targetUserId: string, restricted: boolean) => {
      if (!activeRoomId) return
      await chatService.restrictUser(activeRoomId, targetUserId, restricted)
      setRooms((prev) =>
        prev.map((r) => (r.id === activeRoomId ? { ...r, isRestricted: restricted } : r))
      )
      toast.success(restricted ? 'User restricted' : 'User unrestricted')
    },
    [activeRoomId]
  )

  // ── Socket Event Handlers ─────────────────────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current

    const handleNewMessage = (msg: ChatMessage) => {
      if (msg.chatRoomId === activeRoomId) {
        setMessages((prev) => {
          // Deduplicate
          if (prev.some((m) => m.id === msg.id)) return prev
          return [...prev, msg]
        })
      }
      // Update rooms list last message
      setRooms((prev) =>
        prev.map((r) =>
          r.id === msg.chatRoomId
            ? {
                ...r,
                lastMessage: msg,
                unreadCount:
                  msg.chatRoomId !== activeRoomId && msg.senderId !== user?.id
                    ? (r.unreadCount ?? 0) + 1
                    : 0,
              }
            : r
        )
      )
    }

    const handleTypingStart = ({ userId, userName, roomId }: TypingUser) => {
      if (roomId !== activeRoomId || userId === user?.id) return
      setTypingUsers((prev) => {
        if (prev.some((t) => t.userId === userId)) return prev
        return [...prev, { userId, userName, roomId }]
      })
    }

    const handleTypingStop = ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((t) => t.userId !== userId))
    }

    const handleMessagesSeen = ({ roomId }: { roomId: string; seenByUserId: string }) => {
      if (roomId !== activeRoomId) return
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })))
    }

    const handleUserOnline = ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(userId))
    }

    const handleUserOffline = ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
      // Update rooms otherUser lastActiveAt
      setRooms((prev) =>
        prev.map((r) =>
          r.otherUser?.id === userId
            ? { ...r, otherUser: { ...r.otherUser!, isOnline: false, lastActiveAt: new Date().toISOString() } }
            : r
        )
      )
    }

    const handleOnlineUsers = ({ userIds }: { userIds: string[] }) => {
      setOnlineUsers(new Set(userIds))
    }

    const handleError = ({ message }: { message: string }) => {
      toast.error(message)
    }

    socket.on('new_message', handleNewMessage)
    socket.on('typing_start', handleTypingStart)
    socket.on('typing_stop', handleTypingStop)
    socket.on('messages_seen', handleMessagesSeen)
    socket.on('user_online', handleUserOnline)
    socket.on('user_offline', handleUserOffline)
    socket.on('online_users', handleOnlineUsers)
    socket.on('error', handleError)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('typing_start', handleTypingStart)
      socket.off('typing_stop', handleTypingStop)
      socket.off('messages_seen', handleMessagesSeen)
      socket.off('user_online', handleUserOnline)
      socket.off('user_offline', handleUserOffline)
      socket.off('online_users', handleOnlineUsers)
      socket.off('error', handleError)
    }
  }, [activeRoomId, user?.id])

  // ── Load rooms on mount ───────────────────────────────────────────────────
  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  // ── Load messages when active room changes ────────────────────────────────
  useEffect(() => {
    if (activeRoomId) {
      setMessages([])
      setNextCursor(null)
      setHasMore(false)
      loadMessages(activeRoomId)
      markSeen()
    }
  }, [activeRoomId])

  // ── Update online status in rooms ─────────────────────────────────────────
  useEffect(() => {
    setRooms((prev) =>
      prev.map((r) => ({
        ...r,
        otherUser: r.otherUser
          ? { ...r.otherUser, isOnline: onlineUsers.has(r.otherUser.id) }
          : undefined,
      }))
    )
  }, [onlineUsers])

  return {
    rooms,
    messages,
    typingUsers,
    onlineUsers,
    isLoadingRooms,
    isLoadingMessages,
    isUploading,
    hasMore,
    loadMore,
    loadRooms,
    sendMessage,
    sendAttachment,
    startTyping,
    stopTyping,
    markSeen,
    muteRoom,
    restrictUser,
    deleteRoom,
    activeRoom: rooms.find((r) => r.id === activeRoomId) || null,
  }
}
