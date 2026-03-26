import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatRoom } from '@/services/chat.service'
import { formatDistanceToNow } from 'date-fns'

interface ConversationListProps {
  rooms: ChatRoom[]
  activeRoomId?: string
  currentUserId: string
  isLoading?: boolean
  onSelect: (room: ChatRoom) => void
}

export function ConversationList({
  rooms,
  activeRoomId,
  currentUserId,
  isLoading,
  onSelect,
}: ConversationListProps) {
  const [query, setQuery] = useState('')

  const filtered = rooms.filter((r) =>
    r.otherUser?.name?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-3 flex-shrink-0">
        <h2 className="font-black text-xl tracking-tight">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9 bg-muted/40 border-border/50 rounded-xl h-9"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading && (
          <div className="space-y-2 p-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="h-11 w-11 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-2.5 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2">
            <Search className="h-8 w-8 opacity-30" />
            <p>{query ? 'No conversations found' : 'No conversations yet'}</p>
          </div>
        )}

        {filtered.map((room) => {
          const isActive = room.id === activeRoomId
          const other = room.otherUser
          const lastMsg = room.lastMessage
          const isOnline = other?.isOnline
          const hasUnread = (room.unreadCount ?? 0) > 0
          const lastTime = lastMsg?.sentAt
            ? formatDistanceToNow(new Date(lastMsg.sentAt), { addSuffix: false })
            : null

          return (
            <button
              key={room.id}
              onClick={() => onSelect(room)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 transition-all text-left hover:bg-muted/50',
                isActive && 'bg-primary/10 border-l-4 border-primary hover:bg-primary/15',
                !isActive && 'border-l-4 border-transparent'
              )}
            >
              {/* Avatar + online dot */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-11 w-11">
                  <AvatarImage src={other?.avatar ?? undefined} />
                  <AvatarFallback className="font-bold bg-primary/10 text-primary">
                    {other?.name?.charAt(0) ?? '?'}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background',
                    isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                  )}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-1">
                  <span className={cn('text-sm truncate', hasUnread ? 'font-bold' : 'font-semibold')}>
                    {other?.name ?? 'Unknown'}
                  </span>
                  {lastTime && (
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{lastTime}</span>
                  )}
                </div>
                <div className="flex justify-between items-center gap-1 mt-0.5">
                  <p
                    className={cn(
                      'text-xs truncate max-w-[160px]',
                      hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'
                    )}
                  >
                    {lastMsg?.type === 'FILE'
                      ? `📎 ${lastMsg.content}`
                      : lastMsg?.content ?? 'No messages yet'}
                  </p>
                  {hasUnread && (
                    <Badge className="h-5 min-w-5 px-1 flex items-center justify-center rounded-full text-[10px] flex-shrink-0">
                      {room.unreadCount}
                    </Badge>
                  )}
                  {room.isMuted && (
                    <span className="text-muted-foreground/50 text-[10px] flex-shrink-0">🔕</span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
