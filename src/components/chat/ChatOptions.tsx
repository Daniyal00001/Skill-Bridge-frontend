import { useState } from 'react'
import { MoreVertical, BellOff, Bell, ShieldBan, ShieldCheck, UserCircle, Trash2, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ChatRoom } from '@/services/chat.service'
import { SendContractModal } from '../modals/SendContractModal'

interface ChatOptionsProps {
  room: ChatRoom
  currentUserId: string
  currentUserRole?: string
  onMute: (muted: boolean) => Promise<void>
  onRestrict: (targetUserId: string, restricted: boolean) => Promise<void>
  onDelete: (roomId: string) => Promise<void>
}

export function ChatOptions({ 
  room, 
  currentUserId, 
  currentUserRole,
  onMute, 
  onRestrict, 
  onDelete 
}: ChatOptionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)
  
  const isMuted = room.isMuted ?? false
  const otherUserId = room.otherUser?.id ?? ''
  
  // Only show "Send Contract" if current user is CLIENT and other user is FREELANCER
  const canSendContract = currentUserRole === 'CLIENT' && room.otherUser?.role === 'FREELANCER'

  const handleMute = async () => {
    setIsLoading(true)
    try { await onMute(!isMuted) } finally { setIsLoading(false) }
  }

  const handleRestrict = async () => {
    setIsLoading(true)
    try { await onRestrict(otherUserId, !room.isRestricted) } finally { setIsLoading(false) }
  }

  const handleDeleteConfirm = async () => {
    setIsLoading(true)
    try { 
      await onDelete(room.id) 
      setIsDeleteDialogOpen(false)
    } finally { 
      setIsLoading(false) 
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" disabled={isLoading}>
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 border-none bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl">
          {canSendContract && (
            <>
              <DropdownMenuItem 
                onClick={() => setIsContractModalOpen(true)} 
                className="gap-2 cursor-pointer font-bold text-primary focus:text-primary focus:bg-primary/5 py-2.5"
              >
                <FileText className="h-4 w-4" />
                <span>Send Contract</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/40" />
            </>
          )}

          <DropdownMenuItem onClick={handleMute} className="gap-2 cursor-pointer py-2.5 font-medium">
            {isMuted ? (
              <><Bell className="h-4 w-4 text-green-500" /><span>Unmute notifications</span></>
            ) : (
              <><BellOff className="h-4 w-4 text-yellow-500" /><span>Mute notifications</span></>
            )}
          </DropdownMenuItem>

          {otherUserId && (
            <DropdownMenuItem onClick={handleRestrict} className="gap-2 cursor-pointer py-2.5 font-medium">
              {room.isRestricted ? (
                <><ShieldCheck className="h-4 w-4 text-green-500" /><span>Unrestrict user</span></>
              ) : (
                <><ShieldBan className="h-4 w-4 text-red-500" /><span>Restrict user</span></>
              )}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-border/40" />
          <DropdownMenuItem 
            onClick={() => setIsDeleteDialogOpen(true)} 
            className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 py-2.5 font-medium"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete conversation</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-border/40" />
          <DropdownMenuItem asChild>
            <a
              href={room.otherUser?.role === 'FREELANCER' ? `/freelancer/${otherUserId}` : '#'}
              className="gap-2 cursor-pointer flex items-center py-2.5 font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              <UserCircle className="h-4 w-4 text-muted-foreground" />
              <span>View profile</span>
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="border-none bg-card/95 backdrop-blur-xl rounded-[2rem] shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black">Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-muted-foreground">
              This will hide the conversation for you. The other participant will still be able to see the message history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl font-bold uppercase text-[10px] tracking-widest border-border/40 hover:bg-accent/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                handleDeleteConfirm()
              }}
              className="rounded-xl font-black bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20 active:scale-95 transition-all"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Contract Modal */}
      {canSendContract && (
        <SendContractModal
          isOpen={isContractModalOpen}
          onClose={() => setIsContractModalOpen(false)}
          freelancerId={otherUserId}
          freelancerName={room.otherUser?.name || 'Freelancer'}
          projectId={room.projectId || undefined}
        />
      )}
    </>
  )
}

